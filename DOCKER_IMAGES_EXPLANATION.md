# Giải Thích Công Dụng Các Docker Images Trong Project

## 📊 **INFRASTRUCTURE SERVICES** (docker-compose.infrastructure.yml)

### 🗄️ **DATABASES - Cơ sở dữ liệu**

#### 1. **postgres-sql** (`postgres:16-alpine`)

- **Công dụng**: Database quan hệ PostgreSQL
- **Sử dụng cho**:
  - Catalog Service (sản phẩm, danh mục, thương hiệu)
  - Discount Service (mã giảm giá)
  - Notification Service (thông báo)
  - Report Service (báo cáo)
  - Keycloak (Identity & Access Management)
- **Port**: 5433
- **Đặc điểm**: Hỗ trợ nhiều databases trong một instance

#### 2. **mongodb** (`mongo:7.0`)

- **Công dụng**: Database NoSQL (Document Database)
- **Sử dụng cho**:
  - Basket Service (giỏ hàng - dữ liệu dạng document phù hợp)
  - Discount Service (một số dữ liệu)
  - Notification Service (lưu trữ notifications)
  - Report Service (một số báo cáo)
- **Port**: 27018
- **Đặc điểm**: Lưu trữ dữ liệu dạng JSON documents, phù hợp cho giỏ hàng

#### 3. **mysql** (`mysql:8.0`)

- **Công dụng**: Database quan hệ MySQL
- **Sử dụng cho**:
  - Inventory Service (quản lý kho hàng)
- **Port**: 3307
- **Đặc điểm**: Database quan hệ truyền thống cho dữ liệu kho hàng

#### 4. **sql-server** (`mcr.microsoft.com/mssql/server:2022-latest`)

- **Công dụng**: Microsoft SQL Server Database
- **Sử dụng cho**:
  - Order Service (quản lý đơn hàng)
- **Port**: 1434
- **Đặc điểm**: Database của Microsoft, phù hợp cho hệ thống đơn hàng phức tạp

---

### 💾 **STORAGE - Lưu trữ Object**

#### 5. **minio** (`minio/minio:latest`)

- **Công dụng**: Object Storage tương thích S3 (Amazon S3 compatible)
- **Sử dụng cho**:
  - Lưu trữ hình ảnh sản phẩm
  - Lưu trữ files, documents
  - Backup dữ liệu
- **Ports**:
  - 9000: API endpoint
  - 9001: Web Console (UI quản lý)
- **Đặc điểm**: Thay thế AWS S3 cho môi trường local/development

---

### 🔐 **IDENTITY & SECURITY - Xác thực và Bảo mật**

#### 6. **keycloak** (`quay.io/keycloak/keycloak:25.0`)

- **Công dụng**: Identity and Access Management (IAM) - Quản lý xác thực và phân quyền
- **Chức năng**:
  - Single Sign-On (SSO)
  - User authentication (đăng nhập)
  - Authorization (phân quyền)
  - Token management (JWT tokens)
  - OAuth2/OpenID Connect
- **Port**: 8080
- **Sử dụng**: Tất cả các services đều sử dụng Keycloak để xác thực

---

### 📨 **MESSAGING & CACHE - Message Broker và Cache**

#### 7. **rabbitmq** (`rabbitmq:3.13-management-alpine`)

- **Công dụng**: Message Broker - Trung gian gửi/nhận messages giữa các services
- **Chức năng**:
  - Event-Driven Communication (giao tiếp theo sự kiện)
  - Publish/Subscribe pattern
  - Queue management
  - Reliable message delivery
- **Ports**:
  - 5673: AMQP connection port
  - 15673: Management UI (web interface)
  - 15692: Metrics port
- **Sử dụng**: Tất cả các services giao tiếp với nhau qua RabbitMQ

#### 8. **redis** (`redis:7.2-alpine`)

- **Công dụng**: In-memory Cache và Session Store
- **Chức năng**:
  - Caching dữ liệu thường xuyên truy cập
  - Session storage (phiên đăng nhập)
  - Shopping cart persistence (lưu giỏ hàng tạm thời)
  - Rate limiting
- **Port**: 6380
- **Đặc điểm**: Dữ liệu lưu trong RAM, truy cập cực nhanh

#### 9. **redisinsight** (`redis/redisinsight:latest`)

- **Công dụng**: Web UI để quản lý và xem dữ liệu trong Redis
- **Chức năng**:
  - Xem keys và values trong Redis
  - Query Redis data
  - Monitor Redis performance
  - Debug Redis operations
- **Port**: 5540
- **Lưu ý**: Tool hỗ trợ development, không cần thiết cho production

#### 10. **redisinsight-init** (`curlimages/curl:latest`)

- **Công dụng**: Init script để tự động cấu hình RedisInsight
- **Chức năng**: Chạy một lần để setup Redis connection trong RedisInsight

---

### 🔍 **SEARCH ENGINE - Công cụ tìm kiếm**

#### 11. **elasticsearch** (`elasticsearch:8.15.0`)

- **Công dụng**: Search Engine - Công cụ tìm kiếm full-text
- **Chức năng**:
  - Full-text search (tìm kiếm toàn văn)
  - Product search với filters
  - Analytics và aggregation
  - Real-time search indexing
- **Port**: 9200
- **Sử dụng**: Search Service sử dụng để tìm kiếm sản phẩm

#### 12. **elasticsearch-init** (`curlimages/curl:latest`)

- **Công dụng**: Init script để cấu hình Elasticsearch settings
- **Chức năng**: Tự động setup disk watermark settings cho Elasticsearch

---

### 📧 **MAIL - Email Testing**

#### 13. **mailhog** (`mailhog/mailhog:latest`)

- **Công dụng**: Email Testing Tool - Công cụ test email trong development
- **Chức năng**:
  - Nhận và lưu tất cả emails được gửi
  - Xem email content qua web UI
  - Không gửi email thật ra ngoài
- **Ports**:
  - 1025: SMTP server (nhận email)
  - 8025: Web UI (xem emails)
- **Sử dụng**: Notification Service sử dụng để test gửi email

---

### 📊 **MONITORING - Giám sát hệ thống**

#### 14. **prometheus** (`prom/prometheus:latest`)

- **Công dụng**: Metrics Collection và Monitoring System
- **Chức năng**:
  - Thu thập metrics từ tất cả services
  - Lưu trữ time-series data
  - Alerting (cảnh báo khi có vấn đề)
  - Query metrics bằng PromQL
- **Port**: 9090
- **Sử dụng**: Thu thập metrics từ tất cả services và infrastructure

#### 15. **grafana** (`grafana/grafana:latest`)

- **Công dụng**: Visualization và Dashboard Platform
- **Chức năng**:
  - Tạo dashboards để visualize metrics
  - Hiển thị graphs, charts từ Prometheus
  - Xem logs từ Loki
  - Xem traces từ Tempo
  - Alerting và notifications
- **Port**: 3000
- **Plugins**: Statusmap, Piechart, Explore Traces

#### 16. **cadvisor** (`gcr.io/cadvisor/cadvisor:latest`)

- **Công dụng**: Container Advisor - Giám sát resource usage của containers
- **Chức năng**:
  - Monitor CPU, Memory, Network, Disk của containers
  - Export metrics cho Prometheus
  - Real-time container stats
- **Port**: 8080 (internal)
- **Sử dụng**: Prometheus thu thập metrics từ cAdvisor

---

### 🔍 **TRACING - Theo dõi Request Flow**

#### 17. **otel-collector** (`otel/opentelemetry-collector:latest`)

- **Công dụng**: OpenTelemetry Collector - Thu thập telemetry data
- **Chức năng**:
  - Nhận traces, metrics, logs từ services
  - Process và export data đến Tempo, Prometheus, Loki
  - Centralized telemetry collection
- **Ports**:
  - 4317: OTLP gRPC receiver
  - 8888: Prometheus metrics
  - 13133: Health check
- **Sử dụng**: Tất cả services gửi telemetry data đến đây

#### 18. **tempo** (`grafana/tempo:latest`)

- **Công dụng**: Distributed Tracing Backend
- **Chức năng**:
  - Lưu trữ traces (theo dõi request flow qua các services)
  - Query traces
  - Tích hợp với Grafana để visualize traces
- **Port**: 3200
- **Sử dụng**: Lưu traces từ tất cả services để debug và monitor

---

### 📝 **LOGGING - Quản lý Logs**

#### 19. **loki** (`grafana/loki:latest`)

- **Công dụng**: Log Aggregation System
- **Chức năng**:
  - Thu thập và lưu trữ logs từ tất cả services
  - Index logs để query nhanh
  - Tích hợp với Grafana để xem logs
- **Port**: 3100
- **Sử dụng**: Centralized logging cho toàn bộ hệ thống

#### 20. **promtail** (`grafana/promtail:latest`)

- **Công dụng**: Log Collection Agent
- **Chức năng**:
  - Đọc log files từ containers
  - Parse và gửi logs đến Loki
  - Label logs để dễ query
- **Ports**:
  - 1514: Syslog
  - 9080: HTTP
- **Sử dụng**: Agent thu thập logs và gửi đến Loki

---

### 🛠️ **ADMIN TOOLS - Công cụ quản trị**

#### 21. **portainer** (`portainer/portainer-ce:latest`)

- **Công dụng**: Docker Container Management UI
- **Chức năng**:
  - Quản lý containers qua web UI
  - Xem logs, stats của containers
  - Start/Stop/Restart containers
  - Quản lý images, volumes, networks
- **Ports**:
  - 9002: HTTP
  - 9443: HTTPS
  - 8000: Agent port
- **Sử dụng**: Tool quản lý Docker containers, không cần thiết cho production

---

## 🚀 **APPLICATION SERVICES** (docker-compose.yml)

### 📡 **API SERVICES - REST APIs**

#### 22. **catalog-api** (`${DOCKERHUB_USERNAME}/catalog-api:latest`)

- **Công dụng**: REST API cho Catalog Service
- **Chức năng**:
  - Quản lý sản phẩm (CRUD)
  - Quản lý danh mục (Categories)
  - Quản lý thương hiệu (Brands)
  - Upload hình ảnh sản phẩm
- **Port**: 5001
- **Database**: PostgreSQL
- **API**: REST endpoints với Swagger

#### 23. **basket-api** (`${DOCKERHUB_USERNAME}/basket-api:latest`)

- **Công dụng**: REST API cho Basket Service (Giỏ hàng)
- **Chức năng**:
  - Thêm/sửa/xóa sản phẩm trong giỏ hàng
  - Lấy thông tin giỏ hàng
  - Tính tổng tiền giỏ hàng
- **Port**: 5006
- **Database**: MongoDB + Redis (cache)
- **Đặc điểm**: Session-based shopping cart

#### 24. **inventory-api** (`${DOCKERHUB_USERNAME}/inventory-api:latest`)

- **Công dụng**: REST API cho Inventory Service (Kho hàng)
- **Chức năng**:
  - Quản lý tồn kho (stock)
  - Reserve/Release inventory
  - Kiểm tra số lượng tồn kho
  - Cập nhật stock khi có đơn hàng
- **Port**: 5002
- **Database**: MySQL
- **Communication**: RabbitMQ (events)

#### 25. **order-api** (`${DOCKERHUB_USERNAME}/order-api:latest`)

- **Công dụng**: REST API cho Order Service (Đơn hàng)
- **Chức năng**:
  - Tạo đơn hàng
  - Xem danh sách đơn hàng
  - Cập nhật trạng thái đơn hàng
  - Xử lý thanh toán
- **Port**: 5005
- **Database**: SQL Server
- **Communication**: RabbitMQ (Saga pattern)

#### 26. **discount-api** (`${DOCKERHUB_USERNAME}/discount-api:latest`)

- **Công dụng**: REST API cho Discount Service (Giảm giá)
- **Chức năng**:
  - Quản lý mã giảm giá (Coupons)
  - Validate mã giảm giá
  - Tính toán discount
  - Quản lý promotions
- **Port**: 5004
- **Database**: PostgreSQL

#### 27. **notification-api** (`${DOCKERHUB_USERNAME}/notification-api:latest`)

- **Công dụng**: REST API cho Notification Service
- **Chức năng**:
  - Gửi email notifications
  - Gửi SMS notifications
  - Quản lý notification templates
  - Lịch sử notifications
- **Port**: 5003
- **Database**: PostgreSQL
- **Email**: MailHog (development)

#### 28. **search-api** (`${DOCKERHUB_USERNAME}/search-api:latest`)

- **Công dụng**: REST API cho Search Service
- **Chức năng**:
  - Tìm kiếm sản phẩm
  - Filter và sort kết quả
  - Faceted search
  - Auto-complete suggestions
- **Port**: 5008
- **Database**: Elasticsearch
- **Đặc điểm**: Full-text search với Elasticsearch

#### 29. **report-api** (`${DOCKERHUB_USERNAME}/report-api:latest`)

- **Công dụng**: REST API cho Report Service
- **Chức năng**:
  - Tạo báo cáo doanh thu
  - Báo cáo sản phẩm bán chạy
  - Analytics và statistics
  - Export reports (Excel, PDF)
- **Port**: 5007
- **Database**: PostgreSQL

#### 30. **communication-api** (`${DOCKERHUB_USERNAME}/communication-api:latest`)

- **Công dụng**: REST API cho Communication Service
- **Chức năng**:
  - Quản lý webhooks
  - External integrations
  - API gateway integrations
  - Third-party service communication
- **Port**: 5009
- **Database**: PostgreSQL

---

### 🔌 **gRPC SERVICES - gRPC Servers**

#### 31. **catalog-grpc** (`${DOCKERHUB_USERNAME}/catalog-grpc:latest`)

- **Công dụng**: gRPC Server cho Catalog Service
- **Chức năng**:
  - Giao tiếp gRPC giữa các services
  - High-performance RPC calls
  - Service-to-service communication
- **Port**: 6001
- **Protocol**: gRPC (binary, faster than REST)

#### 32. **inventory-grpc** (`${DOCKERHUB_USERNAME}/inventory-grpc:latest`)

- **Công dụng**: gRPC Server cho Inventory Service
- **Port**: 6002
- **Sử dụng**: Order Service gọi để check inventory

#### 33. **order-grpc** (`${DOCKERHUB_USERNAME}/order-grpc:latest`)

- **Công dụng**: gRPC Server cho Order Service
- **Port**: 6005
- **Sử dụng**: Các services khác query order info

#### 34. **discount-grpc** (`${DOCKERHUB_USERNAME}/discount-grpc:latest`)

- **Công dụng**: gRPC Server cho Discount Service
- **Port**: 6004
- **Sử dụng**: Validate discount codes

#### 35. **report-grpc** (`${DOCKERHUB_USERNAME}/report-grpc:latest`)

- **Công dụng**: gRPC Server cho Report Service
- **Port**: 6007
- **Sử dụng**: Query report data

---

### ⚙️ **WORKER SERVICES - Background Workers**

#### 36. **catalog-worker-outbox** (`${DOCKERHUB_USERNAME}/catalog-worker-outbox:latest`)

- **Công dụng**: Outbox Pattern Worker cho Catalog Service
- **Chức năng**:
  - Đọc events từ Outbox table trong database
  - Publish events lên RabbitMQ
  - Đảm bảo reliable event publishing
- **Pattern**: Outbox Pattern (đảm bảo events được publish ngay cả khi service crash)

#### 37. **basket-worker-outbox** (`${DOCKERHUB_USERNAME}/basket-worker-outbox:latest`)

- **Công dụng**: Outbox Worker cho Basket Service
- **Chức năng**: Publish basket events (checkout, item added, etc.)

#### 38. **inventory-worker-outbox** (`${DOCKERHUB_USERNAME}/inventory-worker-outbox:latest`)

- **Công dụng**: Outbox Worker cho Inventory Service
- **Chức năng**: Publish inventory events (stock changed, reserved, etc.)

#### 39. **order-worker-outbox** (`${DOCKERHUB_USERNAME}/order-worker-outbox:latest`)

- **Công dụng**: Outbox Worker cho Order Service
- **Chức năng**: Publish order events (order created, status changed, etc.)

#### 40. **catalog-worker-consumer** (`${DOCKERHUB_USERNAME}/catalog-worker-consumer:latest`)

- **Công dụng**: Event Consumer cho Catalog Service
- **Chức năng**:
  - Lắng nghe events từ RabbitMQ
  - Xử lý integration events từ services khác
  - Update catalog data khi có events
- **Pattern**: Inbox Pattern (idempotent processing)

#### 41. **inventory-worker-consumer** (`${DOCKERHUB_USERNAME}/inventory-worker-consumer:latest`)

- **Công dụng**: Event Consumer cho Inventory Service
- **Chức năng**: Xử lý events từ Order Service (reserve inventory, release, etc.)

#### 42. **order-worker-consumer** (`${DOCKERHUB_USERNAME}/order-worker-consumer:latest`)

- **Công dụng**: Event Consumer cho Order Service
- **Chức năng**: Xử lý events từ Inventory, Payment services

#### 43. **search-worker-consumer** (`${DOCKERHUB_USERNAME}/search-worker-consumer:latest`)

- **Công dụng**: Event Consumer cho Search Service
- **Chức năng**:
  - Lắng nghe product events từ Catalog
  - Index products vào Elasticsearch
  - Update search index khi có thay đổi

#### 44. **notification-worker-consumer** (`${DOCKERHUB_USERNAME}/notification-worker-consumer:latest`)

- **Công dụng**: Event Consumer cho Notification Service
- **Chức năng**: Nhận events và tạo notification tasks

#### 45. **notification-worker-processor** (`${DOCKERHUB_USERNAME}/notification-worker-processor:latest`)

- **Công dụng**: Notification Processor Worker
- **Chức năng**:
  - Xử lý notification tasks
  - Gửi emails qua MailHog/SMTP
  - Gửi SMS notifications
  - Retry failed notifications

---

### 🌐 **GATEWAY & APPS - API Gateway và Frontend**

#### 46. **api-gateway** (`${DOCKERHUB_USERNAME}/api-gateway:latest`)

- **Công dụng**: YARP API Gateway - Reverse Proxy và Routing
- **Chức năng**:
  - Single entry point cho tất cả APIs
  - Route requests đến đúng service
  - Load balancing
  - Authentication/Authorization
  - Rate limiting
  - Request/Response transformation
- **Port**: 15009
- **Technology**: YARP (Yet Another Reverse Proxy)

#### 47. **app-admin** (`${DOCKERHUB_USERNAME}/app-admin:latest`)

- **Công dụng**: Admin Frontend Application
- **Chức năng**:
  - Quản lý sản phẩm, đơn hàng
  - Dashboard admin
  - Quản lý users, roles
  - Reports và analytics
- **Port**: 3001
- **Technology**: React + Vite + TailwindCSS
- **Access**: http://localhost:3001

#### 48. **app-store** (`${DOCKERHUB_USERNAME}/app-store:latest`)

- **Công dụng**: Customer Store Frontend Application
- **Chức năng**:
  - Trang web mua sắm cho khách hàng
  - Browse products
  - Shopping cart
  - Checkout
  - User account management
- **Port**: 3002
- **Technology**: React + Vite + Bootstrap
- **Access**: http://localhost:3002

#### 49. **app-job** (`${DOCKERHUB_USERNAME}/job-orchestrator:latest`)

- **Công dụng**: Job Orchestrator - Scheduled Background Jobs
- **Chức năng**:
  - Chạy scheduled jobs (cron jobs)
  - Cleanup old data
  - Generate reports
  - Sync data giữa services
  - Maintenance tasks
- **Technology**: Quartz.NET
- **Sử dụng**: Chạy các công việc định kỳ

---

## 🔄 **UTILITY IMAGES - Images hỗ trợ**

#### 50. **curlimages/curl:latest**

- **Công dụng**: Utility image chứa curl command
- **Sử dụng trong**:
  - `elasticsearch-init`: Cấu hình Elasticsearch
  - `redisinsight-init`: Cấu hình RedisInsight
- **Chức năng**: Chạy HTTP requests để setup/config các services

---

## 📋 **TÓM TẮT THEO NHÓM**

### **Databases (4 services)**

- PostgreSQL: Catalog, Discount, Notification, Report, Keycloak
- MongoDB: Basket, một số data của Discount/Notification/Report
- MySQL: Inventory
- SQL Server: Order

### **Message & Cache (3 services)**

- RabbitMQ: Event-driven communication
- Redis: Cache và session storage
- RedisInsight: Redis management UI

### **Storage (1 service)**

- MinIO: Object storage (images, files)

### **Identity (1 service)**

- Keycloak: Authentication & Authorization

### **Search (1 service)**

- Elasticsearch: Full-text search engine

### **Monitoring Stack (5 services)**

- Prometheus: Metrics collection
- Grafana: Visualization dashboards
- cAdvisor: Container metrics
- OpenTelemetry Collector: Telemetry aggregation
- Tempo: Distributed tracing

### **Logging Stack (2 services)**

- Loki: Log aggregation
- Promtail: Log collection agent

### **Development Tools (3 services)**

- MailHog: Email testing
- Portainer: Docker management UI
- RedisInsight: Redis management UI

### **Application APIs (9 services)**

- Catalog, Basket, Inventory, Order, Discount, Notification, Search, Report, Communication

### **gRPC Servers (5 services)**

- Catalog, Inventory, Order, Discount, Report gRPC servers

### **Workers (10 services)**

- 4 Outbox workers: Publish events
- 5 Consumer workers: Process events
- 1 Processor worker: Process notifications

### **Gateway & Frontend (3 services)**

- API Gateway: YARP reverse proxy
- App.Admin: Admin frontend
- App.Store: Customer frontend

### **Job Orchestrator (1 service)**

- App.Job: Scheduled background jobs

---

## 🎯 **LUỒNG HOẠT ĐỘNG**

1. **User Request** → API Gateway → Service API
2. **Service API** → Database (lưu data) → Outbox Table
3. **Outbox Worker** → Đọc Outbox → Publish RabbitMQ
4. **Consumer Workers** → Nhận events → Xử lý → Update services khác
5. **Metrics/Logs/Traces** → OpenTelemetry Collector → Prometheus/Loki/Tempo
6. **Grafana** → Query và visualize từ Prometheus/Loki/Tempo

---

**Tổng cộng: ~50 Docker containers** để chạy toàn bộ hệ thống microservices!
