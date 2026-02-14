-- Tabel stok per menu (menu_id = Sanity menuItem._id)
CREATE TABLE IF NOT EXISTS menu_stock (
    menu_id TEXT PRIMARY KEY,
    quantity INT NOT NULL DEFAULT 0,
    default_quantity INT
);

COMMENT ON TABLE menu_stock IS 'Stok saat ini per menu; menu_id mengacu ke Sanity menuItem._id';
