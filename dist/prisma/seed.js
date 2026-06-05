"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting seed...');
    const permissions = [
        { code: 'sellers.view', name: 'View Sellers', module: 'sellers' },
        { code: 'sellers.create', name: 'Create Seller', module: 'sellers' },
        { code: 'sellers.update', name: 'Update Seller', module: 'sellers' },
        { code: 'sellers.delete', name: 'Delete Seller', module: 'sellers' },
        { code: 'products.view', name: 'View Products', module: 'products' },
        { code: 'products.create', name: 'Create Product', module: 'products' },
        { code: 'products.update', name: 'Update Product', module: 'products' },
        { code: 'products.delete', name: 'Delete Product', module: 'products' },
        { code: 'products.import', name: 'Import Products', module: 'products' },
        { code: 'products.export', name: 'Export Products', module: 'products' },
        { code: 'couriers.view', name: 'View Couriers', module: 'couriers' },
        { code: 'couriers.manage', name: 'Manage Couriers', module: 'couriers' },
        { code: 'inventory.view', name: 'View Inventory', module: 'inventory' },
        { code: 'inventory.adjust', name: 'Adjust Inventory', module: 'inventory' },
        { code: 'inbound.view', name: 'View Inbound', module: 'inbound' },
        { code: 'inbound.create', name: 'Create Inbound', module: 'inbound' },
        { code: 'inbound.update', name: 'Update Inbound', module: 'inbound' },
        { code: 'inbound.receive', name: 'Receive Inbound', module: 'inbound' },
        { code: 'inbound.cancel', name: 'Cancel Inbound', module: 'inbound' },
        { code: 'outbound.view', name: 'View Outbound', module: 'outbound' },
        { code: 'outbound.create', name: 'Create Outbound', module: 'outbound' },
        { code: 'outbound.update', name: 'Update Outbound', module: 'outbound' },
        { code: 'outbound.cancel', name: 'Cancel Outbound', module: 'outbound' },
        { code: 'picking.view', name: 'View Picking Tasks', module: 'picking' },
        { code: 'picking.manage', name: 'Manage Picking', module: 'picking' },
        { code: 'packing.view', name: 'View Packing Tasks', module: 'packing' },
        { code: 'packing.manage', name: 'Manage Packing', module: 'packing' },
        { code: 'returns.view', name: 'View Returns', module: 'returns' },
        { code: 'returns.create', name: 'Create Return', module: 'returns' },
        { code: 'returns.inspect', name: 'Inspect Return', module: 'returns' },
        { code: 'manifests.view', name: 'View Manifests', module: 'manifests' },
        { code: 'manifests.manage', name: 'Manage Manifests', module: 'manifests' },
        { code: 'opname.view', name: 'View Stock Opname', module: 'opname' },
        { code: 'opname.manage', name: 'Manage Stock Opname', module: 'opname' },
        { code: 'reports.view', name: 'View Reports', module: 'reports' },
        { code: 'reports.export', name: 'Export Reports', module: 'reports' },
        { code: 'users.view', name: 'View Users', module: 'users' },
        { code: 'users.manage', name: 'Manage Users', module: 'users' },
        { code: 'roles.view', name: 'View Roles', module: 'roles' },
        { code: 'roles.manage', name: 'Manage Roles', module: 'roles' },
        { code: 'audit.view', name: 'View Audit Logs', module: 'audit' },
        { code: 'help.view', name: 'View Help Center', module: 'help' },
        { code: 'help.manage', name: 'Manage Help Articles', module: 'help' },
        { code: 'dashboard.view', name: 'View Dashboard', module: 'dashboard' },
        { code: 'notifications.view', name: 'View Notifications', module: 'notifications' },
        { code: 'settings.view', name: 'View Settings', module: 'settings' },
        { code: 'settings.manage', name: 'Manage Settings', module: 'settings' },
    ];
    for (const perm of permissions) {
        await prisma.permission.upsert({
            where: { code: perm.code },
            update: {},
            create: perm,
        });
    }
    console.log('✅ Permissions seeded');
    const rolePermissionMap = {
        WAREHOUSE_ADMIN: permissions.map((p) => p.code),
        SELLER: [
            'products.view', 'products.create', 'products.update', 'products.delete',
            'products.import', 'products.export',
            'couriers.view',
            'inventory.view',
            'inbound.view', 'inbound.create', 'inbound.update',
            'outbound.view', 'outbound.create', 'outbound.update',
            'returns.view', 'returns.create',
            'reports.view', 'reports.export',
            'users.view', 'users.manage',
            'dashboard.view',
            'notifications.view',
            'help.view',
        ],
    };
    await prisma.rolePermission.deleteMany({
        where: {
            role: { notIn: Object.keys(rolePermissionMap) },
        },
    });
    for (const [role, codes] of Object.entries(rolePermissionMap)) {
        for (const code of codes) {
            const perm = await prisma.permission.findUnique({ where: { code } });
            if (!perm)
                continue;
            await prisma.rolePermission.upsert({
                where: { role_permissionId: { role: role, permissionId: perm.id } },
                update: {},
                create: { role: role, permissionId: perm.id },
            });
        }
    }
    console.log('✅ Role permissions seeded');
    const couriers = [
        { code: 'JNE', name: 'JNE', logo: '/couriers/jne.png' },
        { code: 'JNT', name: 'J&T Express', logo: '/couriers/jnt.png' },
        { code: 'POS', name: 'POS Indonesia', logo: '/couriers/pos.png' },
        { code: 'SAP', name: 'SAP Express', logo: '/couriers/sap.png' },
        { code: 'TIKI', name: 'TIKI', logo: '/couriers/tiki.png' },
        { code: 'SHOPEE', name: 'Shopee Express', logo: '/couriers/shopee.png' },
        { code: 'GRAB', name: 'Grab Express', logo: '/couriers/grab.png' },
        { code: 'GOJEK', name: 'GoSend (Gojek)', logo: '/couriers/gojek.png' },
        { code: 'SELF', name: 'Self Pickup', logo: null },
    ];
    for (const courier of couriers) {
        await prisma.courier.upsert({
            where: { code: courier.code },
            update: {},
            create: courier,
        });
    }
    console.log('✅ Couriers seeded');
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@wms.local';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
    const adminName = process.env.SEED_ADMIN_NAME || 'System Administrator';
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: { role: client_1.UserRole.WAREHOUSE_ADMIN },
        create: {
            email: adminEmail,
            password: hashedAdminPassword,
            name: adminName,
            role: client_1.UserRole.WAREHOUSE_ADMIN,
            status: 'ACTIVE',
        },
    });
    await prisma.userPreference.upsert({
        where: { userId: admin.id },
        update: {},
        create: { userId: admin.id, language: 'ID', theme: 'light', timezone: 'Asia/Jakarta' },
    });
    console.log(`✅ Admin user seeded: ${adminEmail}`);
    const demoSeller = await prisma.seller.upsert({
        where: { code: 'DEMO001' },
        update: {},
        create: {
            code: 'DEMO001',
            name: 'Demo Seller',
            address: 'Jl. Demo No. 1, Jakarta',
            phone: '081234567890',
            email: 'seller@demo.com',
            status: client_1.SellerStatus.ACTIVE,
        },
    });
    console.log('✅ Demo seller seeded');
    const sellerUserPassword = await bcrypt.hash('Seller@123', 12);
    const sellerUser = await prisma.user.upsert({
        where: { email: 'seller@demo.com' },
        update: { role: client_1.UserRole.SELLER },
        create: {
            email: 'seller@demo.com',
            password: sellerUserPassword,
            name: 'Demo Seller',
            role: client_1.UserRole.SELLER,
            sellerId: demoSeller.id,
            status: 'ACTIVE',
        },
    });
    await prisma.userPreference.upsert({
        where: { userId: sellerUser.id },
        update: {},
        create: { userId: sellerUser.id, language: 'ID', theme: 'light', timezone: 'Asia/Jakarta' },
    });
    console.log('✅ Demo seller user seeded');
    const demoProducts = [
        { sku: 'SKU-001', name: 'Kaos Polos Hitam M', barcode: '8991234567001', hpp: 45000, weight: 0.2, unit: 'pcs' },
        { sku: 'SKU-002', name: 'Kaos Polos Hitam L', barcode: '8991234567002', hpp: 45000, weight: 0.2, unit: 'pcs' },
        { sku: 'SKU-003', name: 'Celana Jeans Slim 30', barcode: '8991234567003', hpp: 185000, weight: 0.6, unit: 'pcs' },
        { sku: 'SKU-004', name: 'Celana Jeans Slim 32', barcode: '8991234567004', hpp: 185000, weight: 0.6, unit: 'pcs' },
        { sku: 'SKU-005', name: 'Sepatu Sneaker White 40', barcode: '8991234567005', hpp: 320000, weight: 1.2, unit: 'pasang' },
    ];
    for (const p of demoProducts) {
        const product = await prisma.product.upsert({
            where: { sellerId_sku: { sellerId: demoSeller.id, sku: p.sku } },
            update: {},
            create: {
                sellerId: demoSeller.id,
                sku: p.sku,
                name: p.name,
                barcode: p.barcode,
                hpp: p.hpp,
                weight: p.weight,
                unit: p.unit,
                status: client_1.ProductStatus.ACTIVE,
            },
        });
        await prisma.inventoryBalance.upsert({
            where: { sellerId_productId: { sellerId: demoSeller.id, productId: product.id } },
            update: {},
            create: {
                sellerId: demoSeller.id,
                productId: product.id,
                available: 100,
                reserved: 0,
                damaged: 0,
                reject: 0,
            },
        });
    }
    console.log('✅ Demo products & inventory balances seeded');
    const configs = [
        { key: 'warehouse.name', value: 'WMS 3PL Warehouse', label: 'Warehouse Name', group: 'general' },
        { key: 'warehouse.address', value: 'Jl. Gudang No. 1, Jakarta Barat', label: 'Warehouse Address', group: 'general' },
        { key: 'warehouse.phone', value: '0211234567', label: 'Warehouse Phone', group: 'general' },
        { key: 'warehouse.email', value: 'info@wms3pl.com', label: 'Warehouse Email', group: 'general' },
        { key: 'inbound.prefix', value: 'IN', label: 'Inbound Number Prefix', group: 'numbering' },
        { key: 'outbound.prefix', value: 'OUT', label: 'Outbound Number Prefix', group: 'numbering' },
        { key: 'return.prefix', value: 'RTN', label: 'Return Number Prefix', group: 'numbering' },
        { key: 'manifest.prefix', value: 'MNF', label: 'Manifest Number Prefix', group: 'numbering' },
        { key: 'opname.prefix', value: 'OPN', label: 'Opname Number Prefix', group: 'numbering' },
        { key: 'label.header', value: 'WMS 3PL', label: 'Shipping Label Header', group: 'label' },
        { key: 'label.footer', value: 'Terima kasih telah berbelanja!', label: 'Shipping Label Footer', group: 'label' },
    ];
    for (const cfg of configs) {
        await prisma.warehouseConfig.upsert({
            where: { key: cfg.key },
            update: {},
            create: cfg,
        });
    }
    console.log('✅ Warehouse config seeded');
    const helpCategories = [
        { slug: 'getting-started', nameEn: 'Getting Started', nameId: 'Memulai', icon: 'rocket', order: 1 },
        { slug: 'inbound', nameEn: 'Inbound', nameId: 'Penerimaan Barang', icon: 'package-plus', order: 2 },
        { slug: 'outbound', nameEn: 'Outbound', nameId: 'Pengiriman Barang', icon: 'package-check', order: 3 },
        { slug: 'inventory', nameEn: 'Inventory', nameId: 'Inventori', icon: 'boxes', order: 4 },
        { slug: 'fulfillment', nameEn: 'Fulfillment', nameId: 'Pick & Pack', icon: 'scan-barcode', order: 5 },
        { slug: 'returns', nameEn: 'Returns', nameId: 'Retur', icon: 'package-x', order: 6 },
        { slug: 'manifests', nameEn: 'Manifests', nameId: 'Manifest', icon: 'clipboard-list', order: 7 },
        { slug: 'reports', nameEn: 'Reports', nameId: 'Laporan', icon: 'bar-chart', order: 8 },
        { slug: 'faq', nameEn: 'FAQ', nameId: 'Pertanyaan Umum', icon: 'help-circle', order: 9 },
    ];
    for (const cat of helpCategories) {
        await prisma.helpCategory.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat,
        });
    }
    console.log('✅ Help categories seeded');
    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📋 Demo accounts (2 roles only):');
    console.log(`  Warehouse Admin:  ${adminEmail} / Admin@123`);
    console.log(`  Seller:           seller@demo.com / Seller@123`);
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map