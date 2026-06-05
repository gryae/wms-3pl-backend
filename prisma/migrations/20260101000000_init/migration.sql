-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('WAREHOUSE_ADMIN', 'SELLER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "SellerStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "InboundType" AS ENUM ('NEW', 'RETURN');

-- CreateEnum
CREATE TYPE "InboundStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'RECEIVING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OutboundType" AS ENUM ('MARKETPLACE', 'SOCIAL_COMMERCE', 'MANUAL');

-- CreateEnum
CREATE TYPE "OutboundStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'ALLOCATED', 'PICKING', 'PACKING', 'READY_TO_SHIP', 'SHIPPED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('SUBMITTED', 'INSPECTING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ManifestStatus" AS ENUM ('OPEN', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StockOpnameStatus" AS ENUM ('DRAFT', 'COUNTING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('INBOUND', 'OUTBOUND', 'RETURN', 'ADJUSTMENT', 'RESERVATION', 'RELEASE');

-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'DAMAGED', 'REJECT');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INBOUND_SUBMITTED', 'INBOUND_COMPLETED', 'OUTBOUND_SUBMITTED', 'PICKING_ASSIGNED', 'PACKING_ASSIGNED', 'SHIPMENT_COMPLETED', 'RETURN_RECEIVED', 'STOCK_OPNAME_COMPLETED', 'GENERAL');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'INVENTORY_CHANGE', 'PERMISSION_CHANGE', 'LOGIN', 'LOGOUT');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('PDF', 'IMAGE', 'EXCEL', 'CSV', 'OTHER');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'ID');

-- CreateEnum
CREATE TYPE "PickTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PackTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "sellerId" TEXT,
    "avatarUrl" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" "Language" NOT NULL DEFAULT 'EN',
    "theme" TEXT NOT NULL DEFAULT 'light',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "module" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sellers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "status" "SellerStatus" NOT NULL DEFAULT 'ACTIVE',
    "logoUrl" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sellers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "barcode" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "hpp" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "length" DECIMAL(10,2),
    "width" DECIMAL(10,2),
    "height" DECIMAL(10,2),
    "weight" DECIMAL(10,3),
    "unit" TEXT NOT NULL DEFAULT 'pcs',
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "imageUrl" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "couriers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "couriers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_balances" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "available" INTEGER NOT NULL DEFAULT 0,
    "reserved" INTEGER NOT NULL DEFAULT 0,
    "damaged" INTEGER NOT NULL DEFAULT 0,
    "reject" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_movements" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "movementType" "MovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "fromStatus" "InventoryStatus",
    "toStatus" "InventoryStatus",
    "referenceType" TEXT,
    "referenceId" TEXT,
    "referenceNo" TEXT,
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_adjustments" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "adjustedBy" TEXT NOT NULL,
    "status" "InventoryStatus" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inbounds" (
    "id" TEXT NOT NULL,
    "inboundNo" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "type" "InboundType" NOT NULL DEFAULT 'NEW',
    "status" "InboundStatus" NOT NULL DEFAULT 'DRAFT',
    "referenceNo" TEXT,
    "notes" TEXT,
    "receivedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "createdById" TEXT NOT NULL,
    "receivedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "inbounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inbound_items" (
    "id" TEXT NOT NULL,
    "inboundId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "expectedQty" INTEGER NOT NULL,
    "receivedQty" INTEGER NOT NULL DEFAULT 0,
    "rejectQty" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "inbound_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inbound_timelines" (
    "id" TEXT NOT NULL,
    "inboundId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "notes" TEXT,
    "userId" TEXT,
    "userName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inbound_timelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbounds" (
    "id" TEXT NOT NULL,
    "outboundNo" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "type" "OutboundType" NOT NULL DEFAULT 'MANUAL',
    "status" "OutboundStatus" NOT NULL DEFAULT 'DRAFT',
    "recipientName" TEXT NOT NULL,
    "recipientPhone" TEXT NOT NULL,
    "recipientAddress" TEXT NOT NULL,
    "recipientCity" TEXT,
    "recipientProvince" TEXT,
    "recipientPostcode" TEXT,
    "courierId" TEXT,
    "trackingNumber" TEXT,
    "shippingCost" DECIMAL(15,2),
    "codAmount" DECIMAL(15,2),
    "notes" TEXT,
    "pickedAt" TIMESTAMP(3),
    "packedAt" TIMESTAMP(3),
    "shippedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "outbounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbound_items" (
    "id" TEXT NOT NULL,
    "outboundId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "pickedQty" INTEGER NOT NULL DEFAULT 0,
    "packedQty" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "outbound_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbound_timelines" (
    "id" TEXT NOT NULL,
    "outboundId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "notes" TEXT,
    "userId" TEXT,
    "userName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outbound_timelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pick_tasks" (
    "id" TEXT NOT NULL,
    "outboundId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "status" "PickTaskStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pick_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pick_task_items" (
    "id" TEXT NOT NULL,
    "pickTaskId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "requiredQty" INTEGER NOT NULL,
    "pickedQty" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT,
    "notes" TEXT,

    CONSTRAINT "pick_task_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pack_tasks" (
    "id" TEXT NOT NULL,
    "outboundId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "status" "PackTaskStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "boxCount" INTEGER,
    "weight" DECIMAL(10,3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pack_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pack_task_items" (
    "id" TEXT NOT NULL,
    "packTaskId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "packedQty" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "pack_task_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "returns" (
    "id" TEXT NOT NULL,
    "returnNo" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "outboundId" TEXT,
    "status" "ReturnStatus" NOT NULL DEFAULT 'SUBMITTED',
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "inspectedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "inspectedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_items" (
    "id" TEXT NOT NULL,
    "returnId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "goodQty" INTEGER NOT NULL DEFAULT 0,
    "damagedQty" INTEGER NOT NULL DEFAULT 0,
    "rejectQty" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "return_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_timelines" (
    "id" TEXT NOT NULL,
    "returnId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "notes" TEXT,
    "userId" TEXT,
    "userName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "return_timelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manifests" (
    "id" TEXT NOT NULL,
    "manifestNo" TEXT NOT NULL,
    "courierId" TEXT NOT NULL,
    "status" "ManifestStatus" NOT NULL DEFAULT 'OPEN',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "closedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manifests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manifest_items" (
    "id" TEXT NOT NULL,
    "manifestId" TEXT NOT NULL,
    "outboundId" TEXT NOT NULL,

    CONSTRAINT "manifest_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_opnames" (
    "id" TEXT NOT NULL,
    "opnameNo" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "status" "StockOpnameStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "countedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_opnames_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_opname_items" (
    "id" TEXT NOT NULL,
    "opnameId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "systemQty" INTEGER NOT NULL,
    "physicalQty" INTEGER NOT NULL DEFAULT 0,
    "variance" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT,
    "notes" TEXT,

    CONSTRAINT "stock_opname_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "entityNo" TEXT,
    "before" JSONB,
    "after" JSONB,
    "description" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_timelines" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "notes" TEXT,
    "userId" TEXT,
    "userName" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_timelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sellerId" TEXT,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "help_categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameId" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "help_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "help_articles" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleId" TEXT NOT NULL,
    "contentEn" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "page" TEXT,
    "tags" TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "help_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_uploads" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileType" "FileType" NOT NULL DEFAULT 'OTHER',
    "entityType" TEXT,
    "entityId" TEXT,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT,
    "group" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_InboundFiles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_OutboundFiles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ReturnFiles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ManifestFiles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "password_resets_token_key" ON "password_resets"("token");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_permissionId_key" ON "role_permissions"("role", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "sellers_code_key" ON "sellers"("code");

-- CreateIndex
CREATE INDEX "products_sellerId_idx" ON "products"("sellerId");

-- CreateIndex
CREATE INDEX "products_barcode_idx" ON "products"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "products_sellerId_sku_key" ON "products"("sellerId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "couriers_code_key" ON "couriers"("code");

-- CreateIndex
CREATE INDEX "inventory_balances_sellerId_idx" ON "inventory_balances"("sellerId");

-- CreateIndex
CREATE INDEX "inventory_balances_productId_idx" ON "inventory_balances"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_balances_sellerId_productId_key" ON "inventory_balances"("sellerId", "productId");

-- CreateIndex
CREATE INDEX "inventory_movements_sellerId_idx" ON "inventory_movements"("sellerId");

-- CreateIndex
CREATE INDEX "inventory_movements_productId_idx" ON "inventory_movements"("productId");

-- CreateIndex
CREATE INDEX "inventory_movements_referenceId_idx" ON "inventory_movements"("referenceId");

-- CreateIndex
CREATE INDEX "inventory_movements_movementType_idx" ON "inventory_movements"("movementType");

-- CreateIndex
CREATE INDEX "inventory_adjustments_sellerId_idx" ON "inventory_adjustments"("sellerId");

-- CreateIndex
CREATE INDEX "inventory_adjustments_productId_idx" ON "inventory_adjustments"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "inbounds_inboundNo_key" ON "inbounds"("inboundNo");

-- CreateIndex
CREATE INDEX "inbounds_sellerId_idx" ON "inbounds"("sellerId");

-- CreateIndex
CREATE INDEX "inbounds_status_idx" ON "inbounds"("status");

-- CreateIndex
CREATE INDEX "inbound_items_inboundId_idx" ON "inbound_items"("inboundId");

-- CreateIndex
CREATE INDEX "inbound_items_productId_idx" ON "inbound_items"("productId");

-- CreateIndex
CREATE INDEX "inbound_timelines_inboundId_idx" ON "inbound_timelines"("inboundId");

-- CreateIndex
CREATE UNIQUE INDEX "outbounds_outboundNo_key" ON "outbounds"("outboundNo");

-- CreateIndex
CREATE INDEX "outbounds_sellerId_idx" ON "outbounds"("sellerId");

-- CreateIndex
CREATE INDEX "outbounds_status_idx" ON "outbounds"("status");

-- CreateIndex
CREATE INDEX "outbounds_trackingNumber_idx" ON "outbounds"("trackingNumber");

-- CreateIndex
CREATE INDEX "outbound_items_outboundId_idx" ON "outbound_items"("outboundId");

-- CreateIndex
CREATE INDEX "outbound_items_productId_idx" ON "outbound_items"("productId");

-- CreateIndex
CREATE INDEX "outbound_timelines_outboundId_idx" ON "outbound_timelines"("outboundId");

-- CreateIndex
CREATE UNIQUE INDEX "pick_tasks_outboundId_key" ON "pick_tasks"("outboundId");

-- CreateIndex
CREATE INDEX "pick_tasks_assigneeId_idx" ON "pick_tasks"("assigneeId");

-- CreateIndex
CREATE INDEX "pick_tasks_status_idx" ON "pick_tasks"("status");

-- CreateIndex
CREATE INDEX "pick_task_items_pickTaskId_idx" ON "pick_task_items"("pickTaskId");

-- CreateIndex
CREATE UNIQUE INDEX "pack_tasks_outboundId_key" ON "pack_tasks"("outboundId");

-- CreateIndex
CREATE INDEX "pack_tasks_assigneeId_idx" ON "pack_tasks"("assigneeId");

-- CreateIndex
CREATE INDEX "pack_tasks_status_idx" ON "pack_tasks"("status");

-- CreateIndex
CREATE INDEX "pack_task_items_packTaskId_idx" ON "pack_task_items"("packTaskId");

-- CreateIndex
CREATE UNIQUE INDEX "returns_returnNo_key" ON "returns"("returnNo");

-- CreateIndex
CREATE INDEX "returns_sellerId_idx" ON "returns"("sellerId");

-- CreateIndex
CREATE INDEX "returns_status_idx" ON "returns"("status");

-- CreateIndex
CREATE INDEX "return_items_returnId_idx" ON "return_items"("returnId");

-- CreateIndex
CREATE INDEX "return_timelines_returnId_idx" ON "return_timelines"("returnId");

-- CreateIndex
CREATE UNIQUE INDEX "manifests_manifestNo_key" ON "manifests"("manifestNo");

-- CreateIndex
CREATE INDEX "manifests_courierId_idx" ON "manifests"("courierId");

-- CreateIndex
CREATE INDEX "manifests_status_idx" ON "manifests"("status");

-- CreateIndex
CREATE INDEX "manifest_items_manifestId_idx" ON "manifest_items"("manifestId");

-- CreateIndex
CREATE UNIQUE INDEX "manifest_items_manifestId_outboundId_key" ON "manifest_items"("manifestId", "outboundId");

-- CreateIndex
CREATE UNIQUE INDEX "stock_opnames_opnameNo_key" ON "stock_opnames"("opnameNo");

-- CreateIndex
CREATE INDEX "stock_opnames_sellerId_idx" ON "stock_opnames"("sellerId");

-- CreateIndex
CREATE INDEX "stock_opnames_status_idx" ON "stock_opnames"("status");

-- CreateIndex
CREATE INDEX "stock_opname_items_opnameId_idx" ON "stock_opname_items"("opnameId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs"("entity");

-- CreateIndex
CREATE INDEX "audit_logs_entityId_idx" ON "audit_logs"("entityId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "activity_timelines_entityType_entityId_idx" ON "activity_timelines"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE UNIQUE INDEX "help_categories_slug_key" ON "help_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "help_articles_slug_key" ON "help_articles"("slug");

-- CreateIndex
CREATE INDEX "help_articles_categoryId_idx" ON "help_articles"("categoryId");

-- CreateIndex
CREATE INDEX "help_articles_page_idx" ON "help_articles"("page");

-- CreateIndex
CREATE INDEX "file_uploads_entityType_entityId_idx" ON "file_uploads"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_configs_key_key" ON "warehouse_configs"("key");

-- CreateIndex
CREATE UNIQUE INDEX "_InboundFiles_AB_unique" ON "_InboundFiles"("A", "B");

-- CreateIndex
CREATE INDEX "_InboundFiles_B_index" ON "_InboundFiles"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OutboundFiles_AB_unique" ON "_OutboundFiles"("A", "B");

-- CreateIndex
CREATE INDEX "_OutboundFiles_B_index" ON "_OutboundFiles"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ReturnFiles_AB_unique" ON "_ReturnFiles"("A", "B");

-- CreateIndex
CREATE INDEX "_ReturnFiles_B_index" ON "_ReturnFiles"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ManifestFiles_AB_unique" ON "_ManifestFiles"("A", "B");

-- CreateIndex
CREATE INDEX "_ManifestFiles_B_index" ON "_ManifestFiles"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_balances" ADD CONSTRAINT "inventory_balances_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_balances" ADD CONSTRAINT "inventory_balances_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_adjustedBy_fkey" FOREIGN KEY ("adjustedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbounds" ADD CONSTRAINT "inbounds_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbounds" ADD CONSTRAINT "inbounds_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbounds" ADD CONSTRAINT "inbounds_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_items" ADD CONSTRAINT "inbound_items_inboundId_fkey" FOREIGN KEY ("inboundId") REFERENCES "inbounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_items" ADD CONSTRAINT "inbound_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_timelines" ADD CONSTRAINT "inbound_timelines_inboundId_fkey" FOREIGN KEY ("inboundId") REFERENCES "inbounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outbounds" ADD CONSTRAINT "outbounds_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outbounds" ADD CONSTRAINT "outbounds_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "couriers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outbounds" ADD CONSTRAINT "outbounds_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outbound_items" ADD CONSTRAINT "outbound_items_outboundId_fkey" FOREIGN KEY ("outboundId") REFERENCES "outbounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outbound_items" ADD CONSTRAINT "outbound_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outbound_timelines" ADD CONSTRAINT "outbound_timelines_outboundId_fkey" FOREIGN KEY ("outboundId") REFERENCES "outbounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pick_tasks" ADD CONSTRAINT "pick_tasks_outboundId_fkey" FOREIGN KEY ("outboundId") REFERENCES "outbounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pick_tasks" ADD CONSTRAINT "pick_tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pick_task_items" ADD CONSTRAINT "pick_task_items_pickTaskId_fkey" FOREIGN KEY ("pickTaskId") REFERENCES "pick_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pack_tasks" ADD CONSTRAINT "pack_tasks_outboundId_fkey" FOREIGN KEY ("outboundId") REFERENCES "outbounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pack_tasks" ADD CONSTRAINT "pack_tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pack_task_items" ADD CONSTRAINT "pack_task_items_packTaskId_fkey" FOREIGN KEY ("packTaskId") REFERENCES "pack_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_outboundId_fkey" FOREIGN KEY ("outboundId") REFERENCES "outbounds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_inspectedById_fkey" FOREIGN KEY ("inspectedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_items" ADD CONSTRAINT "return_items_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES "returns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_items" ADD CONSTRAINT "return_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_timelines" ADD CONSTRAINT "return_timelines_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES "returns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manifests" ADD CONSTRAINT "manifests_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "couriers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manifests" ADD CONSTRAINT "manifests_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manifest_items" ADD CONSTRAINT "manifest_items_manifestId_fkey" FOREIGN KEY ("manifestId") REFERENCES "manifests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manifest_items" ADD CONSTRAINT "manifest_items_outboundId_fkey" FOREIGN KEY ("outboundId") REFERENCES "outbounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_opnames" ADD CONSTRAINT "stock_opnames_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_opname_items" ADD CONSTRAINT "stock_opname_items_opnameId_fkey" FOREIGN KEY ("opnameId") REFERENCES "stock_opnames"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_opname_items" ADD CONSTRAINT "stock_opname_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_timelines" ADD CONSTRAINT "activity_timelines_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "help_articles" ADD CONSTRAINT "help_articles_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "help_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InboundFiles" ADD CONSTRAINT "_InboundFiles_A_fkey" FOREIGN KEY ("A") REFERENCES "file_uploads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InboundFiles" ADD CONSTRAINT "_InboundFiles_B_fkey" FOREIGN KEY ("B") REFERENCES "inbounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OutboundFiles" ADD CONSTRAINT "_OutboundFiles_A_fkey" FOREIGN KEY ("A") REFERENCES "file_uploads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OutboundFiles" ADD CONSTRAINT "_OutboundFiles_B_fkey" FOREIGN KEY ("B") REFERENCES "outbounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReturnFiles" ADD CONSTRAINT "_ReturnFiles_A_fkey" FOREIGN KEY ("A") REFERENCES "file_uploads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReturnFiles" ADD CONSTRAINT "_ReturnFiles_B_fkey" FOREIGN KEY ("B") REFERENCES "returns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ManifestFiles" ADD CONSTRAINT "_ManifestFiles_A_fkey" FOREIGN KEY ("A") REFERENCES "file_uploads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ManifestFiles" ADD CONSTRAINT "_ManifestFiles_B_fkey" FOREIGN KEY ("B") REFERENCES "manifests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

