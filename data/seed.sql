
> spark-tracker@1.0.0 db:seed:sql
> tsx scripts/seed-sql.ts

-- Spark Tracker seed data. Safe to run more than once:
-- every row is keyed on seed_key, so re-running inserts nothing new.
-- Run the migrations first (Vercel does this on deploy).

BEGIN;

INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#1', '2026-09-06', 'trip', '62.75', '0.00', false, NULL, NULL, NULL, NULL, NULL, 'Week of 8/31 total, no per-order breakdown')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#2', '2026-09-07', 'trip', '25.77', '0.00', false, '8612', 1, '5:02 PM', NULL, NULL, '')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#3', '2026-09-07', 'trip', '26.49', '0.00', false, '9875', 1, '6:36 PM', NULL, NULL, '')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#4', '2026-09-07', 'trip', '45.51', '0.00', false, '3748', 1, '8:37 PM', NULL, NULL, '')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#5', '2026-09-08', 'trip', '37.68', '0.00', false, '8596', 1, '8:08 PM', NULL, NULL, '')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#6', '2026-09-08', 'incentive', '4.00', '0.00', false, NULL, NULL, NULL, NULL, NULL, 'Incentive')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#7', '2026-09-09', 'trip', '12.33', '0.00', false, '0185', 1, '9:49 AM', NULL, NULL, '')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#8', '2026-09-09', 'trip', '10.00', '0.00', false, '9915', 1, '1:09 PM', NULL, NULL, '')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#9', '2026-09-09', 'trip', '13.57', '0.00', false, '1118', 1, '1:48 PM', NULL, NULL, '')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#10', '2026-09-09', 'trip', '28.79', '0.00', false, '9304', 3, '5:17 PM', NULL, NULL, '')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#11', '2026-09-09', 'trip', '69.42', '0.00', false, '6458', 1, '9:16 PM', NULL, NULL, '')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#12', '2026-09-09', 'trip', '18.95', '0.00', false, '5743', 1, '10:24 PM', NULL, NULL, '')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#13', '2026-09-10', 'trip', '10.00', '0.00', false, '5797', 1, '10:48 AM', NULL, NULL, '')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#14', '2026-09-10', 'trip', '41.59', '0.00', false, '6281', 1, '1:57 PM', NULL, NULL, '')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#15', '2026-09-10', 'trip', '39.16', '0.00', false, '2399', 1, '8:42 PM', NULL, NULL, '')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#16', '2026-09-10', 'tip', '0.00', '8.85', false, NULL, NULL, NULL, '200015425067806', '2026-09-09', '')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#17', '2026-09-10', 'tip', '0.00', '4.93', false, NULL, NULL, NULL, '200015141977277', '2026-09-09', '')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#18', '2026-09-10', 'tip', '0.00', '2.00', false, NULL, NULL, NULL, '200015144602007', '2026-09-09', '')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#19', '2026-09-10', 'tip', '0.00', '15.00', false, NULL, NULL, NULL, '200015271696791', '2026-09-09', '')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#20', '2026-09-10', 'tip', '0.00', '5.00', false, NULL, NULL, NULL, '200015159772077', '2026-09-09', '')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#21', '2026-09-11', 'trip', '10.00', '0.00', false, '5534', 1, '10:06 AM', NULL, NULL, '')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#22', '2026-09-11', 'trip', '27.07', '0.00', false, '7946', 3, '11:25 AM', NULL, NULL, '')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#23', '2026-09-11', 'trip', '24.50', '0.00', false, '0435', 2, '1:25 PM', NULL, NULL, '')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#24', '2026-09-11', 'trip', '21.00', '0.00', false, '3518', 2, '5:21 PM', NULL, NULL, '')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#25', '2026-09-11', 'trip', '54.37', '0.00', false, '2926', 1, '7:42 PM', NULL, NULL, '')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#26', '2026-09-11', 'tip', '0.00', '6.44', false, NULL, NULL, NULL, '200015179655152', '2026-09-10', '')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#27', '2026-09-12', 'trip', '17.28', '0.00', false, '7081', 1, '1:16 PM', NULL, NULL, '')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#28', '2026-09-12', 'trip', '21.57', '0.00', false, '9007', 3, '2:29 PM', NULL, NULL, 'Cancelled at 2:29 PM, still paid')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#29', '2026-09-12', 'tip', '0.00', '2.82', false, NULL, NULL, NULL, '200015159773449', '2026-09-11', '')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#30', '2026-09-12', 'tip', '0.00', '5.00', false, NULL, NULL, NULL, '200015149322559', '2026-09-11', '')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#31', '2026-09-12', 'tip', '0.00', '5.10', false, NULL, NULL, NULL, '200015405565265', '2026-09-11', '')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#32', '2026-09-12', 'trip', '66.69', '0.00', false, NULL, NULL, NULL, NULL, NULL, 'Rest of Saturday — awaiting per-trip detail')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO entries (seed_key, date, kind, base, tip, wife_along, trip_number, orders, completed_time, order_number, delivered_date, notes)
VALUES ('seed-entries#33', '2026-09-12', 'tip', '0.00', '2.00', false, NULL, NULL, NULL, NULL, NULL, 'Confirmed tip not yet matched to an order')
ON CONFLICT (seed_key) DO NOTHING;

INSERT INTO wife_ledger (seed_key, date, kind, amount, notes)
VALUES ('seed-wife-payments#1', '2026-09-11', 'paid', '41.00', 'Earned before 9/12, orders unknown')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO wife_ledger (seed_key, date, kind, amount, notes)
VALUES ('seed-wife-payments#2', '2026-09-11', 'paid', '25.00', 'Earned before 9/12, orders unknown')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO wife_ledger (seed_key, date, kind, amount, notes)
VALUES ('seed-wife-payments#3', '2026-09-11', 'paid', '20.00', 'Earned before 9/12, orders unknown')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO wife_ledger (seed_key, date, kind, amount, notes)
VALUES ('seed-wife-payments#4', '2026-09-11', 'paid', '21.00', 'Earned before 9/12, orders unknown')
ON CONFLICT (seed_key) DO NOTHING;
INSERT INTO wife_ledger (seed_key, date, kind, amount, notes)
VALUES ('seed-wife-payments#5', '2026-09-11', 'paid', '38.00', 'Earned before 9/12, orders unknown')
ON CONFLICT (seed_key) DO NOTHING;

INSERT INTO settings (id, weekly_goal) VALUES (1, '500.00')
ON CONFLICT (id) DO NOTHING;

COMMIT;
