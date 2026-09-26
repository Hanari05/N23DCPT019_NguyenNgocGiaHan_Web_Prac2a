const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const prisma = require('./config/prisma');
const tokens = require('./tokens');
const { authenticate } = require('./middleware/auth');
const app = express();
app.use(require('helmet')());
app.use(require('cors')({ origin:process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : false }));
app.use(express.json({ limit:'16kb' }));
app.get('/health', (req,res)=>res.json({ success:true, service:'auth-service' }));
app.use('/api/auth', rateLimit({ windowMs:15*60*1000, limit:100, standardHeaders:true, legacyHeaders:false }));
const wrap = fn => (req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
const validate = (req,res,next)=>{ const errors=validationResult(req); if(!errors.isEmpty()) return res.status(422).json({ success:false, errors:errors.array().map(({path,msg})=>({path,msg})) }); next(); };
const credentials = [body('email').isEmail().bail().trim().toLowerCase(), body('password').isString().bail().isLength({min:8,max:72}).custom(v=>Buffer.byteLength(v,'utf8')<=72)];
const select = { id:true, name:true, email:true, role:true, createdAt:true };
const publicUser = ({passwordHash, ...user})=>user;
app.post('/api/auth/register', body('name').isString().bail().trim().isLength({min:2,max:100}), credentials, validate, wrap(async(req,res)=>{
  const {name,email,password}=req.body;
  const user=await prisma.user.create({data:{name,email,passwordHash:await bcrypt.hash(password,12),role:'user'},select});
  res.status(201).json({success:true,data:user});
}));
app.post('/api/auth/login', credentials, validate, wrap(async(req,res)=>{
  const user=await prisma.user.findUnique({where:{email:req.body.email}});
  if(!user || !await bcrypt.compare(req.body.password,user.passwordHash)) return res.status(401).json({success:false,message:'Email hoặc mật khẩu không đúng'});
  const pair=tokens.issue(user);
  await prisma.refreshToken.create({data:tokens.record(user.id,pair.refreshToken)});
  res.set('Cache-Control','no-store').json({success:true,data:{user:publicUser(user),...pair}});
}));
app.post('/api/auth/refresh', body('refreshToken').isString().isLength({min:20,max:2000}), validate, wrap(async(req,res)=>{
  let payload;
  try { payload=tokens.verifyRefresh(req.body.refreshToken); } catch { return res.status(401).json({success:false,message:'Refresh token không hợp lệ hoặc hết hạn'}); }
  const result=await prisma.$transaction(async tx=>{
    const consumed=await tx.refreshToken.updateMany({where:{tokenHash:tokens.hash(req.body.refreshToken),userId:Number(payload.sub),revokedAt:null,expiresAt:{gt:new Date()}},data:{revokedAt:new Date()}});
    if(consumed.count!==1) return null;
    const user=await tx.user.findUnique({where:{id:Number(payload.sub)}});
    if(!user) return null;
    const pair=tokens.issue(user);
    await tx.refreshToken.create({data:tokens.record(user.id,pair.refreshToken)});
    return pair;
  });
  if(!result) return res.status(401).json({success:false,message:'Refresh token đã dùng hoặc bị thu hồi'});
  res.set('Cache-Control','no-store').json({success:true,data:result});
}));
app.get('/api/auth/me',authenticate,wrap(async(req,res)=>{
  const user=await prisma.user.findUnique({where:{id:req.user.id},select});
  if(!user) return res.status(401).json({success:false,message:'Tài khoản không tồn tại'});
  res.json({success:true,data:user});
}));
app.use((req,res)=>res.status(404).json({success:false,message:'Route không tồn tại'}));
app.use((err,req,res,next)=>{
  const status=err.code==='P2002'?409:err.type==='entity.parse.failed'?400:err.type==='entity.too.large'?413:500;
  res.status(status).json({success:false,message:status===409?'Email đã được đăng ký':status===400?'JSON không hợp lệ':status===413?'Request quá lớn':'Lỗi hệ thống'});
});
module.exports=app;
