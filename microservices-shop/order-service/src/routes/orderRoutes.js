/**
 * @openapi
 * {
 *   "/api/orders": {
 *     "get": {
 *       "summary": "Danh sách đơn hàng",
 *       "parameters": [
 *         {
 *           "name": "page",
 *           "in": "query",
 *           "schema": {
 *             "type": "integer",
 *             "minimum": 1,
 *             "default": 1
 *           }
 *         },
 *         {
 *           "name": "limit",
 *           "in": "query",
 *           "schema": {
 *             "type": "integer",
 *             "minimum": 1,
 *             "maximum": 100,
 *             "default": 10
 *           }
 *         },
 *         {
 *           "name": "status",
 *           "in": "query",
 *           "schema": {
 *             "type": "string",
 *             "enum": [
 *               "pending",
 *               "confirmed",
 *               "shipping",
 *               "delivered",
 *               "cancelled"
 *             ]
 *           }
 *         }
 *       ],
 *       "responses": {
 *         "200": {
 *           "description": "Thành công",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "type": "object",
 *                 "properties": {
 *                   "success": {
 *                     "type": "boolean"
 *                   },
 *                   "data": {
 *                     "type": "array",
 *                     "items": {
 *                       "$ref": "#/components/schemas/Order"
 *                     }
 *                   },
 *                   "pagination": {
 *                     "type": "object",
 *                     "properties": {
 *                       "total": {
 *                         "type": "integer"
 *                       },
 *                       "page": {
 *                         "type": "integer"
 *                       },
 *                       "limit": {
 *                         "type": "integer"
 *                       },
 *                       "totalPages": {
 *                         "type": "integer"
 *                       }
 *                     }
 *                   }
 *                 }
 *               }
 *             }
 *           }
 *         },
 *         "400": {
 *           "description": "JSON sai định dạng",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "401": {
 *           "description": "Thiếu/sai/hết hạn access token"
 *         },
 *         "403": {
 *           "description": "Không được truy cập đơn của khách hàng khác"
 *         },
 *         "404": {
 *           "description": "Không tìm thấy",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "409": {
 *           "description": "Dữ liệu trùng",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "422": {
 *           "description": "Validation thất bại",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "500": {
 *           "description": "Lỗi hệ thống",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "503": {
 *           "description": "Service phụ thuộc không khả dụng",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         }
 *       },
 *       "security": [
 *         {
 *           "bearerAuth": []
 *         }
 *       ],
 *       "description": " Người dùng chỉ truy cập đơn của mình; admin truy cập tất cả. customerId khi tạo luôn lấy từ JWT, không tin body."
 *     },
 *     "post": {
 *       "summary": "Tạo đơn hàng từ productId và quantity",
 *       "parameters": [],
 *       "responses": {
 *         "201": {
 *           "description": "Thành công",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "type": "object",
 *                 "properties": {
 *                   "success": {
 *                     "type": "boolean"
 *                   },
 *                   "data": {
 *                     "$ref": "#/components/schemas/Order"
 *                   }
 *                 }
 *               }
 *             }
 *           }
 *         },
 *         "400": {
 *           "description": "JSON sai định dạng",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "401": {
 *           "description": "Thiếu/sai/hết hạn access token"
 *         },
 *         "403": {
 *           "description": "Không được truy cập đơn của khách hàng khác"
 *         },
 *         "404": {
 *           "description": "Không tìm thấy",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "409": {
 *           "description": "Dữ liệu trùng",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "422": {
 *           "description": "Validation thất bại",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "500": {
 *           "description": "Lỗi hệ thống",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "503": {
 *           "description": "Service phụ thuộc không khả dụng",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         }
 *       },
 *       "requestBody": {
 *         "required": true,
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "$ref": "#/components/schemas/OrderInput"
 *             }
 *           }
 *         }
 *       },
 *       "security": [
 *         {
 *           "bearerAuth": []
 *         }
 *       ],
 *       "description": " Người dùng chỉ truy cập đơn của mình; admin truy cập tất cả. customerId khi tạo luôn lấy từ JWT, không tin body."
 *     }
 *   },
 *   "/api/orders/customer/{customerId}": {
 *     "get": {
 *       "summary": "Đơn hàng theo khách",
 *       "parameters": [
 *         {
 *           "name": "customerId",
 *           "in": "path",
 *           "required": true,
 *           "schema": {
 *             "type": "integer"
 *           }
 *         },
 *         {
 *           "name": "page",
 *           "in": "query",
 *           "schema": {
 *             "type": "integer",
 *             "minimum": 1,
 *             "default": 1
 *           }
 *         },
 *         {
 *           "name": "limit",
 *           "in": "query",
 *           "schema": {
 *             "type": "integer",
 *             "minimum": 1,
 *             "maximum": 100,
 *             "default": 10
 *           }
 *         },
 *         {
 *           "name": "status",
 *           "in": "query",
 *           "schema": {
 *             "type": "string",
 *             "enum": [
 *               "pending",
 *               "confirmed",
 *               "shipping",
 *               "delivered",
 *               "cancelled"
 *             ]
 *           }
 *         }
 *       ],
 *       "responses": {
 *         "200": {
 *           "description": "Thành công",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "type": "object",
 *                 "properties": {
 *                   "success": {
 *                     "type": "boolean"
 *                   },
 *                   "data": {
 *                     "type": "array",
 *                     "items": {
 *                       "$ref": "#/components/schemas/Order"
 *                     }
 *                   },
 *                   "pagination": {
 *                     "type": "object",
 *                     "properties": {
 *                       "total": {
 *                         "type": "integer"
 *                       },
 *                       "page": {
 *                         "type": "integer"
 *                       },
 *                       "limit": {
 *                         "type": "integer"
 *                       },
 *                       "totalPages": {
 *                         "type": "integer"
 *                       }
 *                     }
 *                   }
 *                 }
 *               }
 *             }
 *           }
 *         },
 *         "400": {
 *           "description": "JSON sai định dạng",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "401": {
 *           "description": "Thiếu/sai/hết hạn access token"
 *         },
 *         "403": {
 *           "description": "Không được truy cập đơn của khách hàng khác"
 *         },
 *         "404": {
 *           "description": "Không tìm thấy",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "409": {
 *           "description": "Dữ liệu trùng",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "422": {
 *           "description": "Validation thất bại",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "500": {
 *           "description": "Lỗi hệ thống",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "503": {
 *           "description": "Service phụ thuộc không khả dụng",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         }
 *       },
 *       "security": [
 *         {
 *           "bearerAuth": []
 *         }
 *       ],
 *       "description": " Người dùng chỉ truy cập đơn của mình; admin truy cập tất cả. customerId khi tạo luôn lấy từ JWT, không tin body."
 *     }
 *   },
 *   "/api/orders/{id}": {
 *     "get": {
 *       "summary": "Lấy đơn hàng theo ObjectId",
 *       "parameters": [
 *         {
 *           "name": "id",
 *           "in": "path",
 *           "required": true,
 *           "schema": {
 *             "type": "string"
 *           }
 *         }
 *       ],
 *       "responses": {
 *         "200": {
 *           "description": "Thành công",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "type": "object",
 *                 "properties": {
 *                   "success": {
 *                     "type": "boolean"
 *                   },
 *                   "data": {
 *                     "$ref": "#/components/schemas/Order"
 *                   }
 *                 }
 *               }
 *             }
 *           }
 *         },
 *         "400": {
 *           "description": "JSON sai định dạng",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "401": {
 *           "description": "Thiếu/sai/hết hạn access token"
 *         },
 *         "403": {
 *           "description": "Không được truy cập đơn của khách hàng khác"
 *         },
 *         "404": {
 *           "description": "Không tìm thấy",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "409": {
 *           "description": "Dữ liệu trùng",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "422": {
 *           "description": "Validation thất bại",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "500": {
 *           "description": "Lỗi hệ thống",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "503": {
 *           "description": "Service phụ thuộc không khả dụng",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         }
 *       },
 *       "security": [
 *         {
 *           "bearerAuth": []
 *         }
 *       ],
 *       "description": " Người dùng chỉ truy cập đơn của mình; admin truy cập tất cả. customerId khi tạo luôn lấy từ JWT, không tin body."
 *     },
 *     "delete": {
 *       "summary": "Xóa thật đơn hàng demo",
 *       "parameters": [
 *         {
 *           "name": "id",
 *           "in": "path",
 *           "required": true,
 *           "schema": {
 *             "type": "string"
 *           }
 *         }
 *       ],
 *       "responses": {
 *         "200": {
 *           "description": "Thành công",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "type": "object",
 *                 "properties": {
 *                   "success": {
 *                     "type": "boolean"
 *                   },
 *                   "message": {
 *                     "type": "string"
 *                   }
 *                 }
 *               }
 *             }
 *           }
 *         },
 *         "400": {
 *           "description": "JSON sai định dạng",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "401": {
 *           "description": "Thiếu/sai/hết hạn access token"
 *         },
 *         "403": {
 *           "description": "Không được truy cập đơn của khách hàng khác"
 *         },
 *         "404": {
 *           "description": "Không tìm thấy",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "409": {
 *           "description": "Dữ liệu trùng",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "422": {
 *           "description": "Validation thất bại",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "500": {
 *           "description": "Lỗi hệ thống",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "503": {
 *           "description": "Service phụ thuộc không khả dụng",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         }
 *       },
 *       "security": [
 *         {
 *           "bearerAuth": []
 *         }
 *       ],
 *       "description": " Người dùng chỉ truy cập đơn của mình; admin truy cập tất cả. customerId khi tạo luôn lấy từ JWT, không tin body."
 *     }
 *   },
 *   "/api/orders/{id}/status": {
 *     "patch": {
 *       "summary": "Cập nhật một phần: trạng thái",
 *       "parameters": [
 *         {
 *           "name": "id",
 *           "in": "path",
 *           "required": true,
 *           "schema": {
 *             "type": "string"
 *           }
 *         }
 *       ],
 *       "responses": {
 *         "200": {
 *           "description": "Thành công",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "type": "object",
 *                 "properties": {
 *                   "success": {
 *                     "type": "boolean"
 *                   },
 *                   "data": {
 *                     "$ref": "#/components/schemas/Order"
 *                   }
 *                 }
 *               }
 *             }
 *           }
 *         },
 *         "400": {
 *           "description": "JSON sai định dạng",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "401": {
 *           "description": "Thiếu/sai/hết hạn access token"
 *         },
 *         "403": {
 *           "description": "Không được truy cập đơn của khách hàng khác"
 *         },
 *         "404": {
 *           "description": "Không tìm thấy",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "409": {
 *           "description": "Dữ liệu trùng",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "422": {
 *           "description": "Validation thất bại",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "500": {
 *           "description": "Lỗi hệ thống",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         },
 *         "503": {
 *           "description": "Service phụ thuộc không khả dụng",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "$ref": "#/components/schemas/Error"
 *               }
 *             }
 *           }
 *         }
 *       },
 *       "requestBody": {
 *         "required": true,
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "type": "object",
 *               "required": [
 *                 "status"
 *               ],
 *               "properties": {
 *                 "status": {
 *                   "type": "string",
 *                   "enum": [
 *                     "pending",
 *                     "confirmed",
 *                     "shipping",
 *                     "delivered",
 *                     "cancelled"
 *                   ]
 *                 }
 *               }
 *             }
 *           }
 *         }
 *       },
 *       "security": [
 *         {
 *           "bearerAuth": []
 *         }
 *       ],
 *       "description": " Người dùng chỉ truy cập đơn của mình; admin truy cập tất cả. customerId khi tạo luôn lấy từ JWT, không tin body."
 *     }
 *   }
 * }
 */
const router = require('express').Router();
const c = require('../controllers/orderController');
const v = require('../middleware/orderValidation');
const wrap = require('../middleware/asyncHandler');
router.use(require('../middleware/auth').authenticate);
router.use((req,res,next)=>{ if(req.method==='POST') req.body.customerId=req.user.id; next(); });
router.get('/', v.list, wrap(c.getOrders));
router.get('/customer/:customerId', v.customerId, v.list, wrap(c.getOrders));
router.get('/:id', v.id, wrap(c.getOrderById));
router.post('/', v.create, wrap(c.createOrder));
router.patch('/:id/status', v.id, v.status, wrap(c.updateOrderStatus));
router.delete('/:id', v.id, wrap(c.deleteOrder));
module.exports = router;
