/**
 * @openapi
 * {
 *   "/api/products": {
 *     "get": {
 *       "summary": "Danh sách: phân trang, tìm kiếm, lọc, sắp xếp",
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
 *           "name": "search",
 *           "in": "query",
 *           "schema": {
 *             "type": "string"
 *           }
 *         },
 *         {
 *           "name": "category",
 *           "in": "query",
 *           "schema": {
 *             "type": "string"
 *           }
 *         },
 *         {
 *           "name": "sortBy",
 *           "in": "query",
 *           "schema": {
 *             "type": "string",
 *             "enum": [
 *               "name",
 *               "price",
 *               "stock",
 *               "createdAt"
 *             ]
 *           }
 *         },
 *         {
 *           "name": "order",
 *           "in": "query",
 *           "schema": {
 *             "type": "string",
 *             "enum": [
 *               "asc",
 *               "desc"
 *             ]
 *           }
 *         },
 *         {
 *           "name": "minPrice",
 *           "in": "query",
 *           "schema": {
 *             "type": "number",
 *             "minimum": 0
 *           }
 *         },
 *         {
 *           "name": "maxPrice",
 *           "in": "query",
 *           "schema": {
 *             "type": "number",
 *             "minimum": 0
 *           }
 *         },
 *         {
 *           "name": "inStock",
 *           "in": "query",
 *           "schema": {
 *             "type": "string",
 *             "enum": [
 *               "true",
 *               "false"
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
 *                       "$ref": "#/components/schemas/Product"
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
 *       }
 *     },
 *     "post": {
 *       "summary": "Tạo sản phẩm",
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
 *                     "$ref": "#/components/schemas/Product"
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
 *           "description": "Chưa đăng nhập"
 *         },
 *         "403": {
 *           "description": "Cần quyền admin"
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
 *               "$ref": "#/components/schemas/ProductInput"
 *             }
 *           }
 *         }
 *       },
 *       "security": [
 *         {
 *           "bearerAuth": []
 *         }
 *       ]
 *     }
 *   },
 *   "/api/products/{id}": {
 *     "get": {
 *       "summary": "Lấy sản phẩm đang hoạt động",
 *       "parameters": [
 *         {
 *           "name": "id",
 *           "in": "path",
 *           "required": true,
 *           "schema": {
 *             "type": "integer"
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
 *                     "$ref": "#/components/schemas/Product"
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
 *       }
 *     },
 *     "put": {
 *       "summary": "Thay thế các trường có thể sửa (giữ ID, slug)",
 *       "parameters": [
 *         {
 *           "name": "id",
 *           "in": "path",
 *           "required": true,
 *           "schema": {
 *             "type": "integer"
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
 *                     "$ref": "#/components/schemas/Product"
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
 *           "description": "Chưa đăng nhập"
 *         },
 *         "403": {
 *           "description": "Cần quyền admin"
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
 *               "$ref": "#/components/schemas/ProductInput"
 *             }
 *           }
 *         }
 *       },
 *       "security": [
 *         {
 *           "bearerAuth": []
 *         }
 *       ]
 *     },
 *     "delete": {
 *       "summary": "Ẩn sản phẩm: isActive=false",
 *       "parameters": [
 *         {
 *           "name": "id",
 *           "in": "path",
 *           "required": true,
 *           "schema": {
 *             "type": "integer"
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
 *           "description": "Chưa đăng nhập"
 *         },
 *         "403": {
 *           "description": "Cần quyền admin"
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
 *       ]
 *     }
 *   },
 *   "/api/categories": {
 *     "get": {
 *       "summary": "Danh mục có sẵn từ seed",
 *       "parameters": [],
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
 *                       "$ref": "#/components/schemas/Category"
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
 *       }
 *     }
 *   },
 *   "/api/products/{id}/image": {
 *     "post": {
 *       "summary": "Upload ảnh sản phẩm (admin, tối đa 5 MB)",
 *       "tags": [
 *         "Products"
 *       ],
 *       "security": [
 *         {
 *           "bearerAuth": []
 *         }
 *       ],
 *       "parameters": [
 *         {
 *           "name": "id",
 *           "in": "path",
 *           "required": true,
 *           "schema": {
 *             "type": "integer",
 *             "minimum": 1
 *           }
 *         }
 *       ],
 *       "requestBody": {
 *         "required": true,
 *         "content": {
 *           "multipart/form-data": {
 *             "schema": {
 *               "type": "object",
 *               "required": [
 *                 "image"
 *               ],
 *               "properties": {
 *                 "image": {
 *                   "type": "string",
 *                   "format": "binary"
 *                 }
 *               }
 *             }
 *           }
 *         }
 *       },
 *       "responses": {
 *         "200": {
 *           "description": "Ảnh đã lưu vào imageUrl"
 *         },
 *         "401": {
 *           "description": "Thiếu/sai token"
 *         },
 *         "403": {
 *           "description": "Cần admin"
 *         },
 *         "404": {
 *           "description": "Không có sản phẩm"
 *         },
 *         "413": {
 *           "description": "File quá lớn"
 *         },
 *         "415": {
 *           "description": "File không phải ảnh hợp lệ"
 *         },
 *         "422": {
 *           "description": "Thiếu file hoặc ID sai"
 *         },
 *         "502": {
 *           "description": "Cloudinary upload lỗi"
 *         },
 *         "503": {
 *           "description": "Chưa cấu hình Cloudinary"
 *         }
 *       }
 *     }
 *   }
 * }
 */
const router = require('express').Router();
const c = require('../controllers/productController');
const v = require('../middleware/productValidation');
const { authenticate, admin } = require('../middleware/auth');
const wrap = require('../middleware/asyncHandler');
const image = require('../controllers/imageController');
router.post('/:id/image', authenticate, admin, v.id, wrap(image.exists), image.parse, wrap(image.upload));
router.get('/', v.productQuery, wrap(c.getProducts));
router.get('/:id', v.id, wrap(c.getProductById));
router.post('/', authenticate, admin, v.productBody, wrap(c.createProduct));
router.put('/:id', authenticate, admin, v.id, v.productBody, wrap(c.updateProduct));
router.delete('/:id', authenticate, admin, v.id, wrap(c.deleteProduct));
module.exports = router;
