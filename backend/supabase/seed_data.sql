-- Seed script: regenerate every table with 6,000 rows each (was 10,000).
-- Safe to review; does NOT touch your live database until you run it.
-- Run with: supabase db query --linked -f backend/supabase/seed_data.sql
-- WARNING: TRUNCATE removes all existing rows in these tables.

BEGIN;

-- ------------------------------------------------------------
-- 1. DIMENSION TABLES (6,000 rows each)
-- ------------------------------------------------------------

TRUNCATE TABLE fact_sales RESTART IDENTITY CASCADE;
TRUNCATE TABLE dim_customer RESTART IDENTITY CASCADE;
TRUNCATE TABLE dim_date RESTART IDENTITY CASCADE;
TRUNCATE TABLE dim_employee RESTART IDENTITY CASCADE;
TRUNCATE TABLE dim_payment RESTART IDENTITY CASCADE;
TRUNCATE TABLE dim_pharmacy RESTART IDENTITY CASCADE;
TRUNCATE TABLE dim_product RESTART IDENTITY CASCADE;
TRUNCATE TABLE dim_supplier RESTART IDENTITY CASCADE;
TRUNCATE TABLE pharmacy_table RESTART IDENTITY CASCADE;

INSERT INTO dim_supplier (supplier_key, supplier_id, supplier_name, contact_person, phone, city, province)
SELECT
    s,
    'SUP-' || LPAD(s::text, 5, '0'),
    'Supplier ' || s,
    'Contact Person ' || s,
    '09' || LPAD(((s * 97) % 90000000)::text, 8, '0'),
    CASE (s % 3) WHEN 0 THEN 'Manila' WHEN 1 THEN 'Cebu' ELSE 'Davao' END,
    CASE (s % 2) WHEN 0 THEN 'NCR' ELSE 'Visayas' END
FROM generate_series(1, 6000) AS s;

INSERT INTO dim_product (product_key, product_id, product_name, generic_name, category, dosage_form, strength, manufacturer, prescription_required, unit_cost, unit_price, effective_date, expiry_date)
SELECT
    s,
    'PROD-' || LPAD(s::text, 5, '0'),
    'Product ' || s,
    'Generic ' || s,
    CASE (s % 4) WHEN 0 THEN 'Antibiotic' WHEN 1 THEN 'Analgesic' WHEN 2 THEN 'Maintenance' ELSE 'Vitamin' END,
    CASE (s % 2) WHEN 0 THEN 'Tablet' ELSE 'Capsule' END,
    CASE (s % 3) WHEN 0 THEN '500mg' WHEN 1 THEN '100mg' ELSE '250mg' END,
    'Manufacturer ' || ((s % 10) + 1),
    (s % 2 = 0),
    ROUND((50 + ((s * 23) % 350))::NUMERIC, 2),
    ROUND((50 + ((s * 23) % 350))::NUMERIC * 1.4, 2),
    DATE '2024-01-01' + ((s * 7) % 365),
    DATE '2024-01-01' + ((s * 7) % 365) + INTERVAL '2 years'
FROM generate_series(1, 6000) AS s;

INSERT INTO dim_pharmacy (pharmacy_key, pharmacy_id, pharmacy_name, branch_name, city, province, region)
SELECT
    s,
    'PHARM-' || LPAD(s::text, 5, '0'),
    'Pharmacy ' || s,
    'Branch ' || ((s % 20) + 1),
    CASE (s % 3) WHEN 0 THEN 'Manila' WHEN 1 THEN 'Cebu' ELSE 'Davao' END,
    CASE (s % 2) WHEN 0 THEN 'NCR' ELSE 'Visayas' END,
    CASE (s % 3) WHEN 0 THEN 'NCR' WHEN 1 THEN 'Central Visayas' ELSE 'Davao Region' END
FROM generate_series(1, 6000) AS s;

INSERT INTO dim_customer (customer_key, customer_id, customer_name, gender, date_of_birth, age_group, city, province)
SELECT
    s,
    'CUST-' || LPAD(s::text, 5, '0'),
    'Customer ' || s,
    CASE (s % 2) WHEN 0 THEN 'Male' ELSE 'Female' END,
    DATE '1970-01-01' + ((s * 13) % 20000),
    CASE (s % 5) WHEN 0 THEN '20s' WHEN 1 THEN '30s' WHEN 2 THEN '40s' WHEN 3 THEN '50s' ELSE '60+' END,
    CASE (s % 3) WHEN 0 THEN 'Manila' WHEN 1 THEN 'Cebu' ELSE 'Davao' END,
    CASE (s % 2) WHEN 0 THEN 'NCR' ELSE 'Visayas' END
FROM generate_series(1, 6000) AS s;

INSERT INTO dim_employee (employee_key, employee_id, employee_name, position, license_number, hire_date)
SELECT
    s,
    'EMP-' || LPAD(s::text, 5, '0'),
    'Employee ' || s,
    CASE (s % 3) WHEN 0 THEN 'Pharmacist' WHEN 1 THEN 'Cashier' ELSE 'Manager' END,
    'LIC-' || LPAD(s::text, 6, '0'),
    DATE '2020-01-01' + ((s * 5) % 1000)
FROM generate_series(1, 6000) AS s;

INSERT INTO dim_payment (payment_key, payment_method, payment_type, description)
SELECT
    s,
    CASE (s % 4) WHEN 0 THEN 'Cash' WHEN 1 THEN 'Card' WHEN 2 THEN 'GCash' ELSE 'Cheque' END,
    CASE (s % 2) WHEN 0 THEN 'In-person' ELSE 'Online' END,
    'Payment via ' || CASE (s % 4) WHEN 0 THEN 'Cash' WHEN 1 THEN 'Card' WHEN 2 THEN 'GCash' ELSE 'Cheque' END
FROM generate_series(1, 6000) AS s;

INSERT INTO dim_date (date_key, full_date, day, month, month_name, quarter, year, day_of_week)
SELECT
    s,
    DATE '2024-01-01' + ((s - 1) % 730),
    EXTRACT(DAY FROM DATE '2024-01-01' + ((s - 1) % 730))::INT,
    EXTRACT(MONTH FROM DATE '2024-01-01' + ((s - 1) % 730))::INT,
    TO_CHAR(DATE '2024-01-01' + ((s - 1) % 730), 'Month'),
    EXTRACT(QUARTER FROM DATE '2024-01-01' + ((s - 1) % 730))::INT,
    EXTRACT(YEAR FROM DATE '2024-01-01' + ((s - 1) % 730))::INT,
    TO_CHAR(DATE '2024-01-01' + ((s - 1) % 730), 'Day')
FROM generate_series(1, 6000) AS s;

-- ------------------------------------------------------------
-- 2. FACT SALES (6,000 rows) — mirrors your original arithmetic
-- ------------------------------------------------------------

INSERT INTO fact_sales (
    sales_key, date_key, product_key, customer_key, pharmacy_key, employee_key,
    supplier_key, payment_key, transaction_id, prescription_number, quantity_sold,
    unit_price, discount_amount, tax_amount, total_amount, cost_amount, profit_amount,
    pharmacy_name, customer_name
)
SELECT
    s,
    ((s - 1) % 6000) + 1,
    ((s - 1) % 6000) + 1,
    ((s - 1) % 6000) + 1,
    ((s - 1) % 6000) + 1,
    ((s - 1) % 6000) + 1,
    ((s - 1) % 6000) + 1,
    ((s - 1) % 6000) + 1,
    'TXN-' || LPAD(s::text, 8, '0'),
    'RX-' || LPAD(s::text, 6, '0'),
    ((s * 3) % 10) + 1,
    ROUND((50 + ((s * 23) % 350))::NUMERIC, 2),
    0,
    ROUND(
        ((50 + ((s * 23) % 350))::NUMERIC * (((s * 13) % 10) + 1)) * 0.12,
        2
    ),
    ROUND(
        (
            (50 + ((s * 23) % 350))::NUMERIC * (((s * 13) % 10) + 1)
        )
        +
        (
            (50 + ((s * 23) % 350))::NUMERIC * (((s * 13) % 10) + 1) * 0.12
        ),
        2
    ),
    ROUND(
        (50 + ((s * 23) % 350))::NUMERIC * (((s * 13) % 10) + 1) * 0.70,
        2
    ),
    ROUND(
        (
            (50 + ((s * 23) % 350))::NUMERIC * (((s * 13) % 10) + 1)
            + (50 + ((s * 23) % 350))::NUMERIC * (((s * 13) % 10) + 1) * 0.12
        )
        - (50 + ((s * 23) % 350))::NUMERIC * (((s * 13) % 10) + 1) * 0.70,
        2
    ),
    'Pharmacy ' || (((s - 1) % 6000) + 1),
    'Customer ' || (((s - 1) % 6000) + 1)
FROM generate_series(1, 6000) AS s;

-- ------------------------------------------------------------
-- 3. PHARMACY_TABLE (6,000 rows)
-- ------------------------------------------------------------

INSERT INTO pharmacy_table (id, created_at)
SELECT s, now() FROM generate_series(1, 6000) AS s;

-- ------------------------------------------------------------
-- 5. ADD SPECIFIC TEST RECORDS (for verifying the chatbot fix)
-- ------------------------------------------------------------

INSERT INTO dim_pharmacy (pharmacy_key, pharmacy_id, pharmacy_name, branch_name, city, province, region)
VALUES (6001, 'PHARM-BICOL', 'BicolCare Pharmacy', 'Main Branch', 'Naga', 'Camarines Sur', 'Bicol Region');

INSERT INTO dim_product (product_key, product_id, product_name, generic_name, category, dosage_form, strength, manufacturer, prescription_required, unit_cost, unit_price, effective_date, expiry_date)
VALUES (6001, 'PROD-AMOX3', 'Amoxicillin 3', 'Amoxicillin', 'Antibiotic', 'Capsule', '500mg', 'MedSource Pharma', true, 83.16, 119.00, DATE '2024-01-01', DATE '2026-01-01');

INSERT INTO dim_supplier (supplier_key, supplier_id, supplier_name, contact_person, phone, city, province)
VALUES (6001, 'SUP-MED3', 'MedSource Philippines 3', 'Juan Dela Cruz', '09123456789', 'Manila', 'NCR');

INSERT INTO dim_supplier (supplier_key, supplier_id, supplier_name, contact_person, phone, city, province)
VALUES (6002, 'SUP-BICOL1', 'Bicol Medical Supply One', 'Maria Santos', '0987654321', 'Naga', 'Camarines Sur');

INSERT INTO dim_customer (customer_key, customer_id, customer_name, gender, date_of_birth, age_group, city, province)
VALUES (6001, 'CUST-TEST', 'Test Customer', 'Female', DATE '1985-01-01', '30s', 'Naga', 'Camarines Sur');

INSERT INTO dim_employee (employee_key, employee_id, employee_name, position, license_number, hire_date)
VALUES (6001, 'EMP-TEST', 'Test Employee', 'Pharmacist', 'LIC-999999', DATE '2020-01-01');

INSERT INTO dim_payment (payment_key, payment_method, payment_type, description)
VALUES (6001, 'Cash', 'In-person', 'Cash payment');

INSERT INTO dim_date (date_key, full_date, day, month, month_name, quarter, year, day_of_week)
VALUES (6001, DATE '2024-06-15', 15, 6, 'June', 2, 2024, 'Saturday');

-- Amoxicillin 3 supplied by MedSource Philippines 3 (the REAL match for q1)
INSERT INTO fact_sales (
    sales_key, date_key, product_key, customer_key, pharmacy_key, employee_key,
    supplier_key, payment_key, transaction_id, prescription_number, quantity_sold,
    unit_price, discount_amount, tax_amount, total_amount, cost_amount, profit_amount,
    pharmacy_name, customer_name
) VALUES (
    6001, 6001, 6001, 6001, 6001, 6001,
    6001, 6001, 'TXN-TEST001', 'RX-TEST001', 10,
    119.00, 0, 143.52, 1199.52, 831.60, 366.52,
    'BicolCare Pharmacy', 'Test Customer'
);

-- BicolCare Pharmacy sales with profit > 200 (for q2)
INSERT INTO fact_sales (
    sales_key, date_key, product_key, customer_key, pharmacy_key, employee_key,
    supplier_key, payment_key, transaction_id, prescription_number, quantity_sold,
    unit_price, discount_amount, tax_amount, total_amount, cost_amount, profit_amount,
    pharmacy_name, customer_name
) VALUES (
    6002, 6001, 6001, 6001, 6001, 6001,
    6001, 6001, 'TXN-TEST002', 'RX-TEST002', 4,
    393.00, 0, 198.64, 1760.64, 1232.40, 660.24,
    'BicolCare Pharmacy', 'Test Customer'
), (
    6003, 6001, 6001, 6001, 6001, 6001,
    6001, 6001, 'TXN-TEST003', 'RX-TEST003', 4,
    383.00, 0, 193.84, 1715.84, 1202.16, 643.44,
    'BicolCare Pharmacy', 'Test Customer'
), (
    6004, 6001, 6001, 6001, 6001, 6001,
    6001, 6001, 'TXN-TEST004', 'RX-TEST004', 4,
    373.00, 0, 189.04, 1671.04, 1171.92, 626.64,
    'BicolCare Pharmacy', 'Test Customer'
);

-- ------------------------------------------------------------
-- 4. VERIFY EVERY TABLE
-- ------------------------------------------------------------

SELECT 'dim_customer' AS table_name, COUNT(*) AS record_count FROM dim_customer
UNION ALL SELECT 'dim_date', COUNT(*) FROM dim_date
UNION ALL SELECT 'dim_employee', COUNT(*) FROM dim_employee
UNION ALL SELECT 'dim_payment', COUNT(*) FROM dim_payment
UNION ALL SELECT 'dim_pharmacy', COUNT(*) FROM dim_pharmacy
UNION ALL SELECT 'dim_product', COUNT(*) FROM dim_product
UNION ALL SELECT 'dim_supplier', COUNT(*) FROM dim_supplier
UNION ALL SELECT 'fact_sales', COUNT(*) FROM fact_sales
UNION ALL SELECT 'pharmacy_table', COUNT(*) FROM pharmacy_table
ORDER BY table_name;

COMMIT;
