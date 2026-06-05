UPDATE users SET role = 'WAREHOUSE_ADMIN' WHERE role NOT IN ('WAREHOUSE_ADMIN');
DELETE FROM role_permissions WHERE role NOT IN ('WAREHOUSE_ADMIN');
DELETE FROM sessions;
DELETE FROM refresh_tokens;
DELETE FROM user_preferences;
