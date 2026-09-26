const multer=require('multer');
const sharp=require('sharp');
const cloudinary=require('cloudinary').v2;
const prisma=require('../config/prisma');
const cache=require('../middleware/cache');
cloudinary.config({cloud_name:process.env.CLOUDINARY_CLOUD_NAME,api_key:process.env.CLOUDINARY_API_KEY,api_secret:process.env.CLOUDINARY_API_SECRET,secure:true});
exports.parse=multer({storage:multer.memoryStorage(),limits:{fileSize:5*1024*1024,files:1,fields:0},fileFilter:(req,file,cb)=>{
 if(!['image/jpeg','image/png','image/webp'].includes(file.mimetype)) return cb(Object.assign(new Error('Chỉ nhận JPEG, PNG, WebP'),{status:415}));
 cb(null,true);
}}).single('image');
exports.exists=async(req,res,next)=>{
 const found=await prisma.product.findFirst({where:{id:req.params.id,isActive:true}});
 if(!found) return res.status(404).json({success:false,message:'Không tìm thấy sản phẩm'});
 next();
};
exports.upload=async(req,res)=>{
 if(!req.file) return res.status(422).json({success:false,message:'Thiếu file trong trường image'});
 let bytes;
 try{
  const meta=await sharp(req.file.buffer,{limitInputPixels:25000000}).metadata();
  if(!['jpeg','png','webp'].includes(meta.format)||meta.pages>1) throw new Error('Unsupported image');
  // Decode + re-encode to reject fake MIME, corrupt files and remove metadata.
  bytes=await sharp(req.file.buffer,{limitInputPixels:25000000}).rotate().webp({quality:85}).toBuffer();
 }catch{return res.status(415).json({success:false,message:'Ảnh không hợp lệ, ảnh động hoặc quá nhiều pixel'});}
 if(!process.env.CLOUDINARY_CLOUD_NAME||!process.env.CLOUDINARY_API_KEY||!process.env.CLOUDINARY_API_SECRET) return res.status(503).json({success:false,message:'Chưa cấu hình Cloudinary'});
 let uploaded;
 try{uploaded=await new Promise((resolve,reject)=>{cloudinary.uploader.upload_stream({folder:'lab2a/products',resource_type:'image',timeout:15000},(err,result)=>err?reject(err):resolve(result)).end(bytes);});}
 catch{return res.status(502).json({success:false,message:'Không tải được ảnh lên Cloudinary'});}
 try{
  const data=await prisma.product.update({where:{id:req.params.id,isActive:true},data:{imageUrl:uploaded.secure_url}});
  await cache.invalidate();
  res.json({success:true,data});
 }catch(err){
  try{await cloudinary.uploader.destroy(uploaded.public_id);}catch{console.error('Cloudinary cleanup failed');}
  throw err;
 }
};
