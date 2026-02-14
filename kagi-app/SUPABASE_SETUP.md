# Supabase Setup — Kagi Ramen

## 1. Buat Supabase Project

Buka [supabase.com](https://supabase.com/) → New Project.

### Credentials

Dari Settings → API:
- **Project URL** → masukkan ke `NEXT_PUBLIC_SUPABASE_URL`
- **Service Role Key** → masukkan ke `SUPABASE_SERVICE_ROLE_KEY`

## 2. SQL: Tabel `orders`

Jalankan di SQL Editor:

```sql
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  table_number TEXT,
  is_takeaway BOOLEAN DEFAULT false,
  items JSONB NOT NULL DEFAULT '[]',
  total_price INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  midtrans_transaction_status TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast order lookup
CREATE INDEX idx_orders_order_id ON orders(order_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

## 3. SQL: Tabel `payments`

```sql
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT REFERENCES orders(order_id),
  transaction_status TEXT,
  status_code TEXT,
  gross_amount DECIMAL(12,2),
  payment_status TEXT,
  raw_notification JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
```

## 4. RLS Policies (Opsional)

```sql
-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (backend only)
CREATE POLICY "Service role full access on orders" ON orders
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on payments" ON payments
  FOR ALL USING (true) WITH CHECK (true);
```

> **Note**: Karena kita hanya mengakses Supabase dari backend (server actions & API routes) menggunakan Service Role Key, RLS di atas memberi akses penuh. Jika nanti menambahkan client-side access, perlu policy yang lebih ketat.

## 5. Webhook URL

Setelah deploy, daftarkan webhook URL di Midtrans Dashboard:
```
https://your-domain.com/api/midtrans/webhook
```
