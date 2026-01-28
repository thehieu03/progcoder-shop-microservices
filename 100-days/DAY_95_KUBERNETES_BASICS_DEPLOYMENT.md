# 📘 Day 95: Kubernetes Basics (Deploying)

## 🎯 Mục tiêu ngày hôm nay

**Problem**: Có 10 containers. 1 cái chết -> ai restart? Muốn scale lên 5 cái Catalog -> làm sao load balance?
**Solution**: **Kubernetes (K8s)** - Container Orchestrator.
**Goal**: Viết file YAML để deploy `Catalog.Api` lên K8s.

**Thời gian ước tính**: 90 phút.

---

## ✅ Checklist

- [ ] Install Minikube (hoặc Docker Desktop K8s).
- [ ] Write `deployment.yaml`.
- [ ] Write `service.yaml`.
- [ ] Apply & Test.

---

## 📋 Hướng dẫn chi tiết từng bước

### Bước 1: Concept (15 phút)

- **Pod**: Đơn vị nhỏ nhất, chứa container.
- **Deployment**: Quản lý Pod (số lượng replica, update version).
- **Service**: Load Balancer nội bộ, cấp IP cố định để các app gọi nhau.

### Bước 2: Deployment Metrics (30 phút)

Tạo `k8s/catalog-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: catalog-api
spec:
  replicas: 2 # Chạy 2 instance
  selector:
    matchLabels:
      app: catalog-api
  template:
    metadata:
      labels:
        app: catalog-api
    spec:
      containers:
        - name: catalog-api
          image: progcoder/catalog-api:latest # Image build Day 94
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8080
          env:
            - name: ConnectionStrings__CatalogDb
              value: "Host=postgres;Database=CatalogDb;..." # Trong K8s nên dùng ConfigMap/Secret
```

### Bước 3: Service (15 phút)

Tạo `k8s/catalog-service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: catalog-service
spec:
  selector:
    app: catalog-api
  ports:
    - protocol: TCP
      port: 80 # Port gọi nội bộ
      targetPort: 8080 # Port container
  type: ClusterIP # Chỉ gọi trong cluster
```

### Bước 4: Deploy (15 phút)

1. Enable K8s trong Docker Desktop Settings.
2. Run command:
   ```bash
   kubectl apply -f k8s/catalog-deployment.yaml
   kubectl apply -f k8s/catalog-service.yaml
   ```
3. Check status:
   ```bash
   kubectl get pods
   ```

Nếu thấy `Running` 2/2 -> Success!

---

**Chúc bạn hoàn thành tốt Day 95!**
