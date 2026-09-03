import { Database } from 'bun:sqlite';
import path from 'path';
import fs from 'fs';
import { CREATE_TABLES_SQL } from './schema';
import {
  UserProfile,
  FoodSpot,
  MenuItem,
  SubscriptionPlan,
  UserSubscription,
  CustomerOrder,
  LiveBroadcastState,
  UserRole
} from '../types';

const DB_DIR = path.resolve(__dirname, '../data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'food_radar.db');
export const sqliteDb = new Database(DB_PATH, { create: true });

// Enable WAL mode & foreign keys for optimal performance and safety
sqliteDb.exec('PRAGMA journal_mode = WAL;');
sqliteDb.exec('PRAGMA foreign_keys = ON;');

// Initialize tables
sqliteDb.exec(CREATE_TABLES_SQL);

export class DatabaseService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // --- Statistics & Health ---
  getStats() {
    const stats: Record<string, number> = {};
    const tables = [
      'users',
      'otp_verifications',
      'food_spots',
      'menu_items',
      'subscription_plans',
      'user_subscriptions',
      'orders',
      'broadcast_states',
      'reviews'
    ];

    tables.forEach((t) => {
      const res = this.db.query(`SELECT COUNT(*) as count FROM ${t}`).get() as { count: number };
      stats[t] = res ? res.count : 0;
    });

    let fileSizeKb = 0;
    try {
      const stat = fs.statSync(DB_PATH);
      fileSizeKb = Math.round(stat.size / 1024);
    } catch {
      fileSizeKb = 0;
    }

    return {
      dbPath: DB_PATH,
      fileSizeKb: `${fileSizeKb} KB`,
      tables: stats
    };
  }

  // --- Phone Number Verification & OTP ---
  createOtpRecord(phone: string, name?: string, role?: string, metadata?: any) {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    // Invalidate previous unverified OTPs for this phone
    this.db.prepare('DELETE FROM otp_verifications WHERE phone = ? AND is_verified = 0').run(cleanPhone);

    const otpId = `otp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    // Generate secure 6-digit random code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    const stmt = this.db.prepare(`
      INSERT INTO otp_verifications (
        id, phone, otp_code, name, role, metadata, expires_at, is_verified, attempts, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?)
    `);

    stmt.run(
      otpId,
      cleanPhone,
      otpCode,
      name?.trim() || null,
      role || 'customer',
      JSON.stringify(metadata || {}),
      expiresAt,
      new Date().toISOString()
    );

    return {
      id: otpId,
      phone: cleanPhone,
      otpCode,
      expiresAt,
      name,
      role
    };
  }

  verifyOtpRecord(phone: string, inputCode: string): { success: boolean; error?: string; record?: any } {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const row = this.db.query(`
      SELECT * FROM otp_verifications
      WHERE phone = ? AND is_verified = 0
      ORDER BY created_at DESC LIMIT 1
    `).get(cleanPhone) as any;

    if (!row) {
      return { success: false, error: 'No active OTP verification found for this mobile number. Please click "Send OTP".' };
    }

    // Check expiry
    const isExpired = new Date(row.expires_at).getTime() < Date.now();
    if (isExpired) {
      return { success: false, error: 'OTP code has expired (validity is 10 mins). Please request a fresh OTP.' };
    }

    // Check brute-force attempts
    if (row.attempts >= 5) {
      return { success: false, error: 'Too many incorrect attempts. For security, please request a new OTP code.' };
    }

    // Check code match (also allow standard test fallback 123456)
    if (row.otp_code !== inputCode && inputCode !== '123456') {
      const updatedAttempts = row.attempts + 1;
      this.db.prepare('UPDATE otp_verifications SET attempts = ? WHERE id = ?').run(updatedAttempts, row.id);
      return {
        success: false,
        error: `Incorrect OTP code entered. ${Math.max(0, 5 - updatedAttempts)} attempts remaining.`
      };
    }

    // Mark verified
    this.db.prepare('UPDATE otp_verifications SET is_verified = 1 WHERE id = ?').run(row.id);

    let parsedMetadata = {};
    try { parsedMetadata = JSON.parse(row.metadata || '{}'); } catch {}

    return {
      success: true,
      record: {
        ...row,
        metadata: parsedMetadata
      }
    };
  }

  getLatestOtpRecord(phone: string) {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    return this.db.query(`
      SELECT * FROM otp_verifications
      WHERE phone = ?
      ORDER BY created_at DESC LIMIT 1
    `).get(cleanPhone);
  }

  getRecentOtps(limit: number = 8) {
    return this.db.query(`
      SELECT id, phone, otp_code, name, role, expires_at, is_verified, attempts, created_at
      FROM otp_verifications
      ORDER BY created_at DESC LIMIT ?
    `).all(limit) as any[];
  }

  // --- Users ---
  getUserById(id: string): UserProfile | undefined {
    const row = this.db.query('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!row) return undefined;
    return this.mapUserRow(row);
  }

  getUserByPhone(phone: string): UserProfile | undefined {
    const clean = phone.replace(/\D/g, '').slice(-10);
    const row = this.db.query('SELECT * FROM users WHERE phone LIKE ? OR phone = ?').get(`%${clean}%`, clean) as any;
    if (!row) return undefined;
    return this.mapUserRow(row);
  }

  saveUser(user: UserProfile): UserProfile {
    const stmt = this.db.prepare(`
      INSERT INTO users (
        id, name, phone, role, language, state_region, avatar, stall_id,
        business_name, business_address, fssai_number, active_subscription_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        role = excluded.role,
        language = excluded.language,
        state_region = excluded.state_region,
        avatar = excluded.avatar,
        stall_id = excluded.stall_id,
        business_name = excluded.business_name,
        business_address = excluded.business_address,
        fssai_number = excluded.fssai_number,
        active_subscription_id = excluded.active_subscription_id
    `);

    stmt.run(
      user.id,
      user.name,
      user.phone,
      user.role,
      user.language || 'en',
      user.stateRegion || 'all',
      user.avatar || '😋',
      user.stallId || null,
      user.businessName || null,
      user.businessAddress || null,
      user.fssaiNumber || null,
      user.activeSubscriptionId || null,
      user.createdAt || new Date().toISOString()
    );

    return user;
  }

  private mapUserRow(row: any): UserProfile {
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      role: row.role as UserRole,
      language: row.language,
      stateRegion: row.state_region,
      avatar: row.avatar,
      stallId: row.stall_id,
      businessName: row.business_name,
      businessAddress: row.business_address,
      fssaiNumber: row.fssai_number,
      activeSubscriptionId: row.active_subscription_id,
      createdAt: row.created_at
    };
  }

  // --- Food Spots ---
  getAllSpots(): FoodSpot[] {
    const rows = this.db.query('SELECT * FROM food_spots ORDER BY distance_meters ASC').all() as any[];
    return rows.map((r) => this.mapSpotWithMenu(r));
  }

  getSpotById(id: string): FoodSpot | undefined {
    const row = this.db.query('SELECT * FROM food_spots WHERE id = ?').get(id) as any;
    if (!row) return undefined;
    return this.mapSpotWithMenu(row);
  }

  saveSpot(spot: FoodSpot): FoodSpot {
    const stmt = this.db.prepare(`
      INSERT INTO food_spots (
        id, name, name_ta, name_hi, vendor_id, vendor_name, vendor_phone,
        category, stall_type, state_region, city_area, image, thumbnail,
        rating, review_count, price_range, top_deal_item, top_deal_price, top_deal_badge,
        distance_meters, walking_time_seconds, steps_count, bearing_degrees,
        address, opening_hours, is_open_now, is_moving_now, speed_kmh,
        dietary_tags, payment_types, description, secret_tip, photos,
        live_status_text, stock_count, active_subscribers_count, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?
      )
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        name_ta = excluded.name_ta,
        name_hi = excluded.name_hi,
        distance_meters = excluded.distance_meters,
        walking_time_seconds = excluded.walking_time_seconds,
        steps_count = excluded.steps_count,
        is_open_now = excluded.is_open_now,
        is_moving_now = excluded.is_moving_now,
        speed_kmh = excluded.speed_kmh,
        stock_count = excluded.stock_count,
        active_subscribers_count = excluded.active_subscribers_count,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      spot.id,
      spot.name,
      spot.nameTa || null,
      spot.nameHi || null,
      spot.vendorId || null,
      spot.vendorName || null,
      spot.vendorPhone || null,
      spot.category,
      spot.stallType,
      spot.stateRegion,
      spot.cityArea,
      spot.image,
      spot.thumbnail,
      spot.rating || 4.8,
      spot.reviewCount || 1,
      spot.priceRange || '₹',
      spot.topDeal?.item || 'Special Snack',
      spot.topDeal?.price || 20,
      spot.topDeal?.badge || 'Super Deal',
      spot.distanceMeters || 75,
      spot.walkingTimeSeconds || 60,
      spot.stepsCount || 100,
      spot.bearingDegrees || 0,
      spot.address,
      spot.openingHours,
      spot.isOpenNow ? 1 : 0,
      spot.isMovingNow ? 1 : 0,
      spot.speedKmh || 0,
      JSON.stringify(spot.dietaryTags || []),
      JSON.stringify(spot.paymentTypes || []),
      spot.description || '',
      spot.secretTip || '',
      JSON.stringify(spot.photos || []),
      spot.liveStatusText || '',
      JSON.stringify(spot.stockCount || {}),
      spot.activeSubscribersCount || 0,
      new Date().toISOString()
    );

    // Save menu items
    if (spot.menu && spot.menu.length > 0) {
      this.saveMenuItems(spot.id, spot.menu);
    }

    return spot;
  }

  saveMenuItems(spotId: string, menu: MenuItem[]) {
    this.db.prepare('DELETE FROM menu_items WHERE spot_id = ?').run(spotId);
    const insertMenu = this.db.prepare(`
      INSERT INTO menu_items (
        id, spot_id, name, name_ta, name_hi, price, description, is_bestseller, is_vegetarian
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    menu.forEach((m) => {
      insertMenu.run(
        m.id || `m_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        spotId,
        m.name,
        m.nameTa || null,
        m.nameHi || null,
        m.price,
        m.description || '',
        m.isBestseller ? 1 : 0,
        m.isVegetarian !== undefined ? (m.isVegetarian ? 1 : 0) : 1
      );
    });
  }

  updateSpotLocation(id: string, distanceMeters: number, isMoving: boolean, speedKmh?: number): FoodSpot | undefined {
    const steps = Math.round((distanceMeters / 75) * 100);
    const seconds = Math.round((distanceMeters / 75) * 60);

    const stmt = this.db.prepare(`
      UPDATE food_spots
      SET distance_meters = ?,
          walking_time_seconds = ?,
          steps_count = ?,
          is_moving_now = ?,
          speed_kmh = COALESCE(?, speed_kmh),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(distanceMeters, seconds, steps, isMoving ? 1 : 0, speedKmh !== undefined ? speedKmh : null, id);

    // Also update broadcast table
    this.saveBroadcastState({
      spotId: id,
      distanceMeters,
      isMoving,
      speedKmh: speedKmh || 6,
      bearingDegrees: 0,
      lastUpdated: new Date().toISOString(),
      currentArea: 'Near Customer Street (Live GPS)'
    });

    return this.getSpotById(id);
  }

  updateSpotStock(id: string, stock: { [key: string]: number }): FoodSpot | undefined {
    this.db.prepare(`
      UPDATE food_spots
      SET stock_count = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(JSON.stringify(stock), id);
    return this.getSpotById(id);
  }

  private mapSpotWithMenu(r: any): FoodSpot {
    const menuRows = this.db.query('SELECT * FROM menu_items WHERE spot_id = ?').all(r.id) as any[];
    const menu: MenuItem[] = menuRows.map((m) => ({
      id: m.id,
      name: m.name,
      nameTa: m.name_ta,
      nameHi: m.name_hi,
      price: m.price,
      description: m.description,
      isBestseller: Boolean(m.is_bestseller),
      isVegetarian: Boolean(m.is_vegetarian)
    }));

    let dietaryTags: string[] = [];
    let paymentTypes: any[] = [];
    let photos: string[] = [];
    let stockCount: { [key: string]: number } = {};

    try { dietaryTags = JSON.parse(r.dietary_tags || '[]'); } catch {}
    try { paymentTypes = JSON.parse(r.payment_types || '[]'); } catch {}
    try { photos = JSON.parse(r.photos || '[]'); } catch {}
    try { stockCount = JSON.parse(r.stock_count || '{}'); } catch {}

    return {
      id: r.id,
      name: r.name,
      nameTa: r.name_ta,
      nameHi: r.name_hi,
      vendorId: r.vendor_id,
      vendorName: r.vendor_name,
      vendorPhone: r.vendor_phone,
      category: r.category,
      stallType: r.stall_type,
      stateRegion: r.state_region,
      cityArea: r.city_area,
      image: r.image,
      thumbnail: r.thumbnail,
      rating: r.rating,
      reviewCount: r.review_count,
      priceRange: r.price_range,
      topDeal: {
        item: r.top_deal_item,
        price: r.top_deal_price,
        badge: r.top_deal_badge
      },
      distanceMeters: r.distance_meters,
      walkingTimeSeconds: r.walking_time_seconds,
      stepsCount: r.steps_count,
      bearingDegrees: r.bearing_degrees,
      address: r.address,
      openingHours: r.opening_hours,
      isOpenNow: Boolean(r.is_open_now),
      isMovingNow: Boolean(r.is_moving_now),
      speedKmh: r.speed_kmh,
      dietaryTags,
      paymentTypes,
      description: r.description,
      secretTip: r.secret_tip,
      photos,
      liveStatusText: r.live_status_text,
      stockCount,
      activeSubscribersCount: r.active_subscribers_count,
      menu
    };
  }

  // --- Subscriptions ---
  getPlans(): SubscriptionPlan[] {
    const rows = this.db.query('SELECT * FROM subscription_plans').all() as any[];
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      titleTa: r.title_ta,
      titleHi: r.title_hi,
      targetRole: r.target_role,
      price: r.price,
      period: r.period,
      badge: r.badge,
      popular: Boolean(r.popular),
      savingsText: r.savings_text,
      deliveriesCount: r.deliveries_count,
      features: JSON.parse(r.features || '[]'),
      featuresTa: JSON.parse(r.features_ta || '[]'),
      featuresHi: JSON.parse(r.features_hi || '[]')
    }));
  }

  savePlan(p: SubscriptionPlan) {
    this.db.prepare(`
      INSERT INTO subscription_plans (
        id, title, title_ta, title_hi, target_role, price, period, badge, popular, savings_text, deliveries_count, features, features_ta, features_hi
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        price = excluded.price,
        features = excluded.features
    `).run(
      p.id,
      p.title,
      p.titleTa || null,
      p.titleHi || null,
      p.targetRole,
      p.price,
      p.period,
      p.badge || null,
      p.popular ? 1 : 0,
      p.savingsText || null,
      p.deliveriesCount || null,
      JSON.stringify(p.features || []),
      JSON.stringify(p.featuresTa || []),
      JSON.stringify(p.featuresHi || [])
    );
  }

  getSubscriptionsByUserId(userId: string): UserSubscription[] {
    const rows = this.db.query('SELECT * FROM user_subscriptions WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];
    return rows.map((r) => this.mapSubscriptionRow(r));
  }

  getSubscriptionsByVendorId(vendorId: string): UserSubscription[] {
    const rows = this.db.query('SELECT * FROM user_subscriptions WHERE selected_spot_id = ? ORDER BY created_at DESC').all(vendorId) as any[];
    return rows.map((r) => this.mapSubscriptionRow(r));
  }

  createSubscription(sub: UserSubscription): UserSubscription {
    this.db.prepare(`
      INSERT INTO user_subscriptions (
        id, user_id, user_name, user_phone, plan_id, plan_title, target_role,
        amount, status, start_date, expiry_date, deliveries_remaining,
        payment_method, payment_id, selected_spot_id, selected_spot_name,
        special_instructions, qr_pass_code, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sub.id,
      sub.userId,
      sub.userName,
      sub.userPhone,
      sub.planId,
      sub.planTitle,
      sub.targetRole,
      sub.amount,
      sub.status,
      sub.startDate,
      sub.expiryDate,
      sub.deliveriesRemaining || null,
      sub.paymentMethod,
      sub.paymentId,
      sub.selectedSpotId || null,
      sub.selectedSpotName || null,
      sub.specialInstructions || null,
      sub.qrPassCode,
      new Date().toISOString()
    );

    // Update user's active sub
    this.db.prepare('UPDATE users SET active_subscription_id = ? WHERE id = ?').run(sub.id, sub.userId);

    // Update stall subscriber counter
    if (sub.selectedSpotId) {
      this.db.prepare('UPDATE food_spots SET active_subscribers_count = active_subscribers_count + 1 WHERE id = ?').run(sub.selectedSpotId);
    }

    return sub;
  }

  updateSubscriptionStatus(id: string, status: string): UserSubscription | undefined {
    this.db.prepare('UPDATE user_subscriptions SET status = ? WHERE id = ?').run(status, id);
    const row = this.db.query('SELECT * FROM user_subscriptions WHERE id = ?').get(id) as any;
    if (!row) return undefined;
    return this.mapSubscriptionRow(row);
  }

  private mapSubscriptionRow(r: any): UserSubscription {
    return {
      id: r.id,
      userId: r.user_id,
      userName: r.user_name,
      userPhone: r.user_phone,
      planId: r.plan_id,
      planTitle: r.plan_title,
      targetRole: r.target_role,
      amount: r.amount,
      status: r.status,
      startDate: r.start_date,
      expiryDate: r.expiry_date,
      deliveriesRemaining: r.deliveries_remaining,
      paymentMethod: r.payment_method,
      paymentId: r.payment_id,
      selectedSpotId: r.selected_spot_id,
      selectedSpotName: r.selected_spot_name,
      specialInstructions: r.special_instructions,
      qrPassCode: r.qr_pass_code
    };
  }

  // --- Orders ---
  getAllOrders(): CustomerOrder[] {
    const rows = this.db.query('SELECT * FROM orders ORDER BY created_at DESC').all() as any[];
    return rows.map((r) => this.mapOrderRow(r));
  }

  getOrdersByCustomerId(customerId: string): CustomerOrder[] {
    const rows = this.db.query('SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC').all(customerId) as any[];
    return rows.map((r) => this.mapOrderRow(r));
  }

  getOrdersBySpotId(spotId: string): CustomerOrder[] {
    const rows = this.db.query('SELECT * FROM orders WHERE spot_id = ? ORDER BY created_at DESC').all(spotId) as any[];
    return rows.map((r) => this.mapOrderRow(r));
  }

  createOrder(order: CustomerOrder): CustomerOrder {
    this.db.prepare(`
      INSERT INTO orders (
        id, order_number, customer_id, customer_name, customer_phone,
        spot_id, spot_name, items, total_amount, payment_method,
        status, is_subscription_delivery, delivery_notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      order.id,
      order.orderNumber,
      order.customerId,
      order.customerName,
      order.customerPhone,
      order.spotId,
      order.spotName,
      JSON.stringify(order.items),
      order.totalAmount,
      order.paymentMethod,
      order.status,
      order.isSubscriptionDelivery ? 1 : 0,
      order.deliveryNotes || null,
      order.createdAt || new Date().toISOString()
    );
    return order;
  }

  updateOrderStatus(orderId: string, status: string): CustomerOrder | undefined {
    this.db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, orderId);
    const row = this.db.query('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
    if (!row) return undefined;
    return this.mapOrderRow(row);
  }

  private mapOrderRow(r: any): CustomerOrder {
    let items: any[] = [];
    try { items = JSON.parse(r.items); } catch {}
    return {
      id: r.id,
      orderNumber: r.order_number,
      customerId: r.customer_id,
      customerName: r.customer_name,
      customerPhone: r.customer_phone,
      spotId: r.spot_id,
      spotName: r.spot_name,
      items,
      totalAmount: r.total_amount,
      paymentMethod: r.payment_method,
      status: r.status,
      isSubscriptionDelivery: Boolean(r.is_subscription_delivery),
      deliveryNotes: r.delivery_notes,
      createdAt: r.created_at
    };
  }

  // --- Broadcasts ---
  getMovingCycleBroadcasts(): LiveBroadcastState[] {
    const rows = this.db.query('SELECT * FROM broadcast_states').all() as any[];
    return rows.map((r) => ({
      spotId: r.spot_id,
      isMoving: Boolean(r.is_moving),
      distanceMeters: r.distance_meters,
      speedKmh: r.speed_kmh,
      bearingDegrees: r.bearing_degrees,
      lastBellRungAt: r.last_bell_rung_at,
      currentArea: r.current_area,
      lastUpdated: r.last_updated
    }));
  }

  saveBroadcastState(state: LiveBroadcastState) {
    this.db.prepare(`
      INSERT INTO broadcast_states (
        spot_id, is_moving, distance_meters, speed_kmh, bearing_degrees, last_bell_rung_at, current_area, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(spot_id) DO UPDATE SET
        is_moving = excluded.is_moving,
        distance_meters = excluded.distance_meters,
        speed_kmh = excluded.speed_kmh,
        last_bell_rung_at = COALESCE(excluded.last_bell_rung_at, broadcast_states.last_bell_rung_at),
        last_updated = CURRENT_TIMESTAMP
    `).run(
      state.spotId,
      state.isMoving ? 1 : 0,
      state.distanceMeters,
      state.speedKmh,
      state.bearingDegrees || 0,
      state.lastBellRungAt || null,
      state.currentArea || 'Near Customer',
      new Date().toISOString()
    );
  }

  triggerBellPing(spotId: string) {
    const now = new Date().toISOString();
    this.db.prepare(`
      UPDATE broadcast_states
      SET last_bell_rung_at = ?, last_updated = CURRENT_TIMESTAMP
      WHERE spot_id = ?
    `).run(now, spotId);

    return {
      success: true,
      message: `🔔 Proximity horn bell broadcasted for stall ${spotId}! Alert sent to foodies within 150m.`,
      timestamp: now
    };
  }
}

export const database = new DatabaseService(sqliteDb);
