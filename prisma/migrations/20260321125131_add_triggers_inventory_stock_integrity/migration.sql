-- Triggers for Inventory integrity
CREATE TRIGGER inventory_integrity_insert BEFORE INSERT ON "Inventory"
BEGIN
  SELECT RAISE(ABORT, 'Quantity must be non-negative') WHERE NEW.quantity < 0;
  SELECT RAISE(ABORT, 'Reserved must be non-negative') WHERE NEW.reserved < 0;
  SELECT RAISE(ABORT, 'Reserved cannot exceed quantity') WHERE NEW.reserved > NEW.quantity;
END;

CREATE TRIGGER inventory_integrity_update BEFORE UPDATE ON "Inventory"
BEGIN
  SELECT RAISE(ABORT, 'Quantity must be non-negative') WHERE NEW.quantity < 0;
  SELECT RAISE(ABORT, 'Reserved must be non-negative') WHERE NEW.reserved < 0;
  SELECT RAISE(ABORT, 'Reserved cannot exceed quantity') WHERE NEW.reserved > NEW.quantity;
END;

-- Triggers for StockTransfer integrity
CREATE TRIGGER stock_transfer_integrity_insert BEFORE INSERT ON "StockTransfer"
BEGIN
  SELECT RAISE(ABORT, 'Quantity must be positive') WHERE NEW.quantity <= 0;
  SELECT RAISE(ABORT, 'Quantity received must be non-negative') WHERE NEW.quantityReceived IS NOT NULL AND NEW.quantityReceived < 0;
  SELECT RAISE(ABORT, 'Quantity received cannot exceed quantity') WHERE NEW.quantityReceived IS NOT NULL AND NEW.quantityReceived > NEW.quantity;
END;

CREATE TRIGGER stock_transfer_integrity_update BEFORE UPDATE ON "StockTransfer"
BEGIN
  SELECT RAISE(ABORT, 'Quantity must be positive') WHERE NEW.quantity <= 0;
  SELECT RAISE(ABORT, 'Quantity received must be non-negative') WHERE NEW.quantityReceived IS NOT NULL AND NEW.quantityReceived < 0;
  SELECT RAISE(ABORT, 'Quantity received cannot exceed quantity') WHERE NEW.quantityReceived IS NOT NULL AND NEW.quantityReceived > NEW.quantity;
END;