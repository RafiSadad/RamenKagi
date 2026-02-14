-- Tabel orders (pesanan dari app + update dari webhook Midtrans)
CREATE TABLE IF NOT EXISTS orders (
    order_id TEXT PRIMARY KEY,
    customer_name TEXT,
    table_number TEXT,
    is_takeaway BOOLEAN DEFAULT false,
    items JSONB DEFAULT '[]',
    total_price NUMERIC DEFAULT 0,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'pending',
    midtrans_transaction_status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Tabel payments (log notifikasi webhook Midtrans)
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    order_id TEXT NOT NULL,
    transaction_status TEXT,
    status_code TEXT,
    gross_amount NUMERIC,
    payment_status TEXT,
    raw_notification JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
