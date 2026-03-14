import React, { useState, useEffect, useRef, Suspense } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, ContactShadows, Environment, PresentationControls } from "@react-three/drei";

// ============================================================
// SUPER DATABASE (In-Memory, Supabase-style)
// ============================================================
const createDatabase = () => {
  let db = {
    menu: [
      { id: 1, name: "Masala Crisp Burger", price: 89, category: "Burgers", emoji: "🍔", description: "Crispy patty with house masala blend & pickled onions", available: true, rating: 4.5, orders: 142 },
      { id: 2, name: "Peri Peri Paneer Burger", price: 109, category: "Burgers", emoji: "🌶️", description: "Grilled paneer with fiery peri peri sauce", available: true, rating: 4.7, orders: 98 },
      { id: 3, name: "Veg Giga Bite", price: 139, category: "Burgers", emoji: "🥬", description: "Double patty loaded veggie tower burger", available: true, rating: 4.3, orders: 76 },
      { id: 4, name: "Aloo Tikki Smash Burger", price: 99, category: "Burgers", emoji: "🥔", description: "Classic smashed aloo tikki with mint chutney", available: true, rating: 4.6, orders: 203 },
      { id: 5, name: "Paneer Tikka Sandwich", price: 179, category: "Sandwiches", emoji: "🥪", description: "Grilled paneer tikka in toasted ciabatta", available: true, rating: 4.4, orders: 89 },
      { id: 6, name: "Bombay Masala Sandwich", price: 89, category: "Sandwiches", emoji: "🌿", description: "Street-style pressed with green chutney", available: true, rating: 4.8, orders: 312 },
      { id: 7, name: "Club Sandwich", price: 149, category: "Sandwiches", emoji: "🥙", description: "Triple-decker with veggies & house sauce", available: true, rating: 4.2, orders: 67 },
      { id: 8, name: "Margherita Pizza", price: 199, category: "Pizzas", emoji: "🍕", description: "Fresh mozzarella, basil, San Marzano tomatoes", available: true, rating: 4.5, orders: 155 },
      { id: 9, name: "Peri Peri Veg Pizza", price: 229, category: "Pizzas", emoji: "🌶️", description: "Loaded with peppers, olives, peri peri drizzle", available: true, rating: 4.6, orders: 118 },
      { id: 10, name: "Paneer Makhani Pizza", price: 249, category: "Pizzas", emoji: "🧀", description: "Rich makhani base with chargrilled paneer", available: true, rating: 4.9, orders: 201 },
      { id: 11, name: "Veg Hakka Noodles", price: 129, category: "Noodles", emoji: "🍜", description: "Wok-tossed with fresh vegetables & soy", available: true, rating: 4.3, orders: 94 },
      { id: 12, name: "Schezwan Noodles", price: 149, category: "Noodles", emoji: "🔥", description: "Extra spicy schezwan with bell peppers", available: true, rating: 4.7, orders: 178 },
      { id: 13, name: "Super Saver Meal for 2", price: 445, category: "Combos", emoji: "🎉", description: "2 Burgers + 2 Fries + 2 Drinks — Best Value!", available: true, rating: 4.8, orders: 234 },
      { id: 14, name: "Single Meal Deal", price: 249, category: "Combos", emoji: "⭐", description: "1 Burger + Fries + Drink + Dessert", available: true, rating: 4.6, orders: 187 },
      { id: 15, name: "Chocolate Shakespeare", price: 89, category: "Shakespeares", emoji: "🍫", description: "Rich Belgian chocolate thick shake", available: true, rating: 4.9, orders: 445 },
      { id: 16, name: "Mango Shakespeare", price: 79, category: "Shakespeares", emoji: "🥭", description: "Fresh Alphonso mango blended shake", available: true, rating: 4.8, orders: 389 },
      { id: 17, name: "Oreo Shakespeare", price: 99, category: "Shakespeares", emoji: "🍪", description: "Crushed Oreo blended with vanilla ice cream", available: true, rating: 4.7, orders: 298 },
      { id: 18, name: "Peri Peri Fries", price: 79, category: "Sides", emoji: "🍟", description: "Crispy fries tossed in signature peri peri", available: true, rating: 4.8, orders: 567 },
    ],
    orders: [
      { id: "GM-001", items: [{ name: "Masala Crisp Burger", qty: 2, price: 89 }, { name: "Peri Peri Fries", qty: 1, price: 79 }], total: 257, status: "Preparing", time: "12:32 PM", customer: "Rahul S." },
      { id: "GM-002", items: [{ name: "Super Saver Meal for 2", qty: 1, price: 445 }], total: 445, status: "Ready", time: "12:28 PM", customer: "Priya M." },
      { id: "GM-003", items: [{ name: "Paneer Makhani Pizza", qty: 1, price: 249 }, { name: "Chocolate Shakespeare", qty: 2, price: 89 }], total: 427, status: "Pending", time: "12:40 PM", customer: "Arjun K." },
    ],
    nextId: 19,
    nextOrderId: 4,
  };

  return {
    // SELECT
    from: (table) => ({
      select: () => ({ data: [...db[table]] }),
      eq: (field, val) => ({ data: db[table].filter(r => r[field] == val) }),
    }),
    // INSERT
    insert: (table, record) => {
      const newRecord = { ...record, id: db.nextId++ };
      db[table].push(newRecord);
      return { data: newRecord, error: null };
    },
    // UPDATE
    update: (table, id, updates) => {
      db[table] = db[table].map(r => r.id == id ? { ...r, ...updates } : r);
      return { error: null };
    },
    // DELETE
    delete: (table, id) => {
      db[table] = db[table].filter(r => r.id != id);
      return { error: null };
    },
    // ORDER INSERT
    insertOrder: (orderData) => {
      const order = { ...orderData, id: `GM-00${db.nextOrderId++}`, status: "Pending", time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) };
      db.orders.push(order);
      return { data: order };
    },
    updateOrderStatus: (id, status) => {
      db.orders = db.orders.map(o => o.id === id ? { ...o, status } : o);
    },
    getStats: () => ({
      totalOrders: db.orders.length,
      totalRevenue: db.orders.reduce((sum, o) => sum + o.total, 0),
      pendingOrders: db.orders.filter(o => o.status === "Pending").length,
      menuItems: db.menu.length,
    }),
  };
};

const DB = createDatabase();

// ============================================================
// 3D BURGER MODEL (Advanced Procedural)
// ============================================================
// The external GLTF model host is blocked by the user's ISP, causing a blank screen.
// This is a highly polished procedural alternative using physical materials.
function BurgerModel() {
  const burgerRef = useRef();

  useFrame((state, delta) => {
    if (burgerRef.current) {
      // Slow auto rotation
      burgerRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={burgerRef} scale={1.4} position={[0, -0.2, 0]}>
      {/* Top Bun */}
      <mesh position={[0, 1.3, 0]}>
        <sphereGeometry args={[1.4, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#ffaa00" roughness={0.4} clearcoat={0.3} clearcoatRoughness={0.2} />
      </mesh>

      {/* Lettuce */}
      <mesh position={[0, 0.9, 0]} scale={[1.1, 1, 1.1]}>
        <torusGeometry args={[1.3, 0.2, 16, 64]} />
        <meshPhysicalMaterial color="#22c55e" roughness={0.7} transmission={0.2} thickness={0.5} />
      </mesh>

      {/* Cheese */}
      <mesh position={[0, 0.6, 0]} rotation={[0, Math.PI / 3, 0]}>
        <boxGeometry args={[2.5, 0.1, 2.5]} />
        <meshPhysicalMaterial color="#facc15" roughness={0.2} metalness={0.1} clearcoat={0.5} />
      </mesh>

      {/* Patty */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[1.35, 1.35, 0.5, 64]} />
        <meshPhysicalMaterial color="#3f271d" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Bottom Bun */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[1.3, 1.2, 0.5, 64]} />
        <meshPhysicalMaterial color="#ffaa00" roughness={0.5} clearcoat={0.1} />
      </mesh>

      <Sparkles count={40} scale={4} size={3} speed={0.4} opacity={0.6} color="#ffd700" />
    </group>
  );
}

// ============================================================
// ERROR BOUNDARY
// ============================================================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#1a1a1a', color: 'white', fontFamily: "'DM Sans', sans-serif", padding: 20 }}>
          <h1 style={{ color: '#e63232', fontSize: 48, marginBottom: 20 }}>Oops! Something went wrong.</h1>
          <p style={{ fontSize: 18, marginBottom: 30, textAlign: 'center', maxWidth: 600 }}>
            We're sorry, but there was an unexpected error loading the application.
            Please try refreshing the page or contact support if the issue persists.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '12px 24px', background: '#e63232', color: 'white', border: 'none', borderRadius: 50, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState(DB.from("orders").select().data);
  const [menu, setMenu] = useState(DB.from("menu").select().data);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showCart, setShowCart] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [adminTab, setAdminTab] = useState("dashboard");
  const [editingPrice, setEditingPrice] = useState({});
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", ...new Set(menu.map(i => i.category))];

  const filteredMenu = menu.filter(item => {
    const matchCat = activeCategory === "All" || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch && item.available;
  });

  const addToCart = (item) => {
    setCart(prev => {
      const exists = prev.find(c => c.id === item.id);
      if (exists) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
    showNotification(`${item.emoji} Added to cart!`);
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(c => c.id !== id));
  const updateQty = (id, delta) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter(c => c.qty > 0));
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);
  const deliveryFree = cartTotal >= 399;

  const placeOrder = () => {
    if (cart.length === 0) return;
    const { data } = DB.insertOrder({ items: cart.map(c => ({ name: c.name, qty: c.qty, price: c.price })), total: cartTotal, customer: "You" });
    setOrders(DB.from("orders").select().data);
    setCart([]);
    setShowCart(false);
    setOrderPlaced(true);
    setTimeout(() => setOrderPlaced(false), 4000);
  };

  const updateMenuPrice = (id) => {
    const newPrice = editingPrice[id];
    if (!newPrice) return;
    DB.update("menu", id, { price: parseInt(newPrice) });
    setMenu(DB.from("menu").select().data);
    setEditingPrice(prev => { const n = { ...prev }; delete n[id]; return n; });
    showNotification("✅ Price updated!");
  };

  const toggleAvailability = (id) => {
    const item = menu.find(i => i.id === id);
    DB.update("menu", id, { available: !item.available });
    setMenu(DB.from("menu").select().data);
  };

  const updateOrderStatus = (orderId, status) => {
    DB.updateOrderStatus(orderId, status);
    setOrders(DB.from("orders").select().data);
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const stats = DB.getStats();

  return (
    <div style={{ fontFamily: "'Bebas Neue', 'Georgia', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } body { background: #0a0a0a; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #e63232; border-radius: 2px; } .fade-in { animation: fadeIn 0.4s ease; } @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } } .slide-in { animation: slideIn 0.35s cubic-bezier(.4,0,.2,1); } @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } } .pulse { animation: pulse 2s infinite; } @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .5; } } .bounce-in { animation: bounceIn 0.5s cubic-bezier(.36,.07,.19,.97); } @keyframes bounceIn { 0% { transform: scale(0.5); opacity:0; } 70% { transform: scale(1.1); } 100% { transform: scale(1); opacity:1; } }`}</style>

      {/* Notification Toast */}
      {notification && (
        <div className="bounce-in" style={{ position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)", background: "#1a1a1a", border: "1px solid #e63232", color: "white", padding: "12px 24px", borderRadius: 50, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, zIndex: 9999, whiteSpace: "nowrap" }}>
          {notification}
        </div>
      )}

      {/* ORDER SUCCESS */}
      {orderPlaced && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9998 }}>
          <div className="bounce-in" style={{ background: "#111", border: "2px solid #22c55e", borderRadius: 24, padding: 48, textAlign: "center", maxWidth: 360 }}>
            <div style={{ fontSize: 72 }}>🎉</div>
            <h2 style={{ color: "white", fontSize: 32, letterSpacing: 2, marginTop: 16 }}>ORDER PLACED!</h2>
            <p style={{ color: "#22c55e", fontFamily: "'DM Sans', sans-serif", marginTop: 8 }}>Your food is being prepared</p>
            <p style={{ color: "#666", fontFamily: "'DM Sans', sans-serif", fontSize: 12, marginTop: 4 }}>Estimated delivery: 25-35 mins</p>
          </div>
        </div>
      )}

      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <ErrorBoundary>
              <UserApp menu={filteredMenu} cart={cart} cartCount={cartCount} cartTotal={cartTotal} deliveryFree={deliveryFree} categories={categories} activeCategory={activeCategory} setActiveCategory={setActiveCategory} searchQuery={searchQuery} setSearchQuery={setSearchQuery} addToCart={addToCart} showCart={showCart} setShowCart={setShowCart} updateQty={updateQty} removeFromCart={removeFromCart} placeOrder={placeOrder} />
            </ErrorBoundary>
          } />
          <Route path="/admin" element={
            <ErrorBoundary>
              <AdminDashboard menu={menu} orders={orders} stats={stats} adminTab={adminTab} setAdminTab={setAdminTab} editingPrice={editingPrice} setEditingPrice={setEditingPrice} updateMenuPrice={updateMenuPrice} toggleAvailability={toggleAvailability} updateOrderStatus={updateOrderStatus} />
            </ErrorBoundary>
          } />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

// ============================================================
// USER APP
// ============================================================
function UserApp({ menu, cart, cartCount, cartTotal, deliveryFree, categories, activeCategory, setActiveCategory, searchQuery, setSearchQuery, addToCart, showCart, setShowCart, updateQty, removeFromCart, placeOrder }) {
  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh" }}>
      {/* Navbar */}
      <nav style={{ background: "#111", borderBottom: "1px solid #1f1f1f", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28 }}>🔥</span>
          <div>
            <h1 style={{ color: "#e63232", fontSize: 28, letterSpacing: 3, lineHeight: 1 }}>GRILL MASTERS</h1>
            <p style={{ color: "#444", fontSize: 10, fontFamily: "'DM Sans', sans-serif", letterSpacing: 2 }}>BIKANER'S FINEST</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search menu..." style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 50, padding: "8px 16px", color: "white", fontFamily: "'DM Sans', sans-serif", fontSize: 13, width: 200, outline: "none" }} />
          </div>
          <button onClick={() => setShowCart(true)} style={{ background: "#e63232", border: "none", borderRadius: 50, padding: "10px 20px", color: "white", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
            🛒 Cart
            {cartCount > 0 && <span style={{ background: "white", color: "#e63232", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900 }}>{cartCount}</span>}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1a0000 0%, #0a0a0a 50%, #1a0500 100%)", padding: "60px 24px", textAlign: "center", borderBottom: "1px solid #1f1f1f", position: "relative", overflow: "hidden", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 32 }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(230,50,50,0.1) 0%, transparent 70%)" }} />

        {/* Text Content */}
        <div style={{ flex: 1, minWidth: 300, zIndex: 10, textAlign: "left" }}>
          <p style={{ color: "#e63232", letterSpacing: 6, fontSize: 12, fontFamily: "'DM Sans', sans-serif", marginBottom: 12 }}>EST. 2019 · BIKANER, RAJASTHAN</p>
          <h2 style={{ color: "white", fontSize: "clamp(48px, 8vw, 96px)", letterSpacing: 4, lineHeight: 0.9 }}>BEST BURGERS<br /><span style={{ color: "#e63232" }}>IN BIKANER</span></h2>
          <p style={{ color: "#888", fontFamily: "'DM Sans', sans-serif", marginTop: 20, fontSize: 16, maxWidth: 400 }}>
            {deliveryFree ? "✅ You qualify for FREE delivery!" : `🚴 Add ₹${399 - (cart.reduce((s, c) => s + c.price * c.qty, 0))} more for FREE delivery`}
          </p>
          <div style={{ display: "flex", gap: 16, marginTop: 32, flexWrap: "wrap" }}>
            {["⭐ 4.7 Rated", "🕐 25-35 mins", "🚴 Free above ₹399", "🔥 200+ Items"].map(tag => (
              <span key={tag} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#aaa", padding: "6px 16px", borderRadius: 50, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* 3D Canvas */}
        <div style={{ width: "100%", maxWidth: 500, height: 400, zIndex: 10, cursor: "grab" }}>
          <Canvas camera={{ position: [0, 1, 5], fov: 45 }}>
            <ambientLight intensity={0.7} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <Environment preset="city" />

            <PresentationControls
              global
              config={{ mass: 2, tension: 500 }}
              snap={{ mass: 4, tension: 1500 }}
              rotation={[0.1, 0, 0]}
              polar={[-Math.PI / 3, Math.PI / 3]}
              azimuth={[-Math.PI / 1.4, Math.PI / 2]}
            >
              <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                <Suspense fallback={null}>
                  <BurgerModel />
                </Suspense>
              </Float>
            </PresentationControls>

            <ContactShadows position={[0, -1.8, 0]} opacity={0.6} scale={10} blur={2.5} far={4} color="#000000" />
          </Canvas>
        </div>
      </div>

      {/* Categories */}
      <div style={{ background: "#111", borderBottom: "1px solid #1f1f1f", padding: "0 24px", display: "flex", gap: 8, overflowX: "auto", position: "sticky", top: 64, zIndex: 90 }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: "14px 20px", background: "none", border: "none", borderBottom: activeCategory === cat ? "3px solid #e63232" : "3px solid transparent", color: activeCategory === cat ? "#e63232" : "#666", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "grid", gap: 16 }}>
          {menu.length === 0 && <p style={{ color: "#444", textAlign: "center", fontFamily: "'DM Sans', sans-serif", padding: 40 }}>No items found.</p>}
          {menu.map(item => (
            <div key={item.id} className="fade-in" style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#333"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#1f1f1f"}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ width: 60, height: 60, background: "#1a1a1a", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>{item.emoji}</div>
                <div>
                  <h4 style={{ color: "white", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16 }}>{item.name}</h4>
                  <p style={{ color: "#555", fontFamily: "'DM Sans', sans-serif", fontSize: 12, marginTop: 2 }}>{item.description}</p>
                  <div style={{ display: "flex", gap: 12, marginTop: 6, alignItems: "center" }}>
                    <span style={{ color: "#e63232", fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 18 }}>₹{item.price}</span>
                    <span style={{ color: "#f59e0b", fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}>⭐ {item.rating}</span>
                    <span style={{ color: "#444", fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}>{item.orders} orders</span>
                  </div>
                </div>
              </div>
              <CartButton item={item} cart={cart} addToCart={addToCart} updateQty={updateQty} />
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Cart Bar */}
      {cart.length > 0 && !showCart && (
        <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: "#e63232", borderRadius: 50, padding: "14px 32px", cursor: "pointer", display: "flex", gap: 24, alignItems: "center", zIndex: 200 }} onClick={() => setShowCart(true)}>
          <span style={{ color: "white", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{cart.reduce((s, c) => s + c.qty, 0)} items</span>
          <span style={{ color: "white", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>View Cart →</span>
          <span style={{ color: "rgba(255,255,255,0.8)", fontFamily: "'DM Sans', sans-serif" }}>₹{cart.reduce((s, c) => s + c.price * c.qty, 0)}</span>
        </div>
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }} onClick={() => setShowCart(false)} />
          <div className="slide-in" style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: Math.min(420, window.innerWidth), background: "#111", borderLeft: "1px solid #1f1f1f", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "24px 24px 16px", borderBottom: "1px solid #1f1f1f", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ color: "white", fontSize: 28, letterSpacing: 2 }}>YOUR CART</h2>
              <button onClick={() => setShowCart(false)} style={{ background: "#1a1a1a", border: "none", color: "#666", fontSize: 20, cursor: "pointer", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
              {cart.length === 0 ? <p style={{ color: "#444", textAlign: "center", fontFamily: "'DM Sans', sans-serif", marginTop: 40 }}>Your cart is empty</p> : cart.map(item => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, padding: 16, background: "#1a1a1a", borderRadius: 12 }}>
                  <div>
                    <p style={{ color: "white", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14 }}>{item.emoji} {item.name}</p>
                    <p style={{ color: "#e63232", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>₹{item.price * item.qty}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button onClick={() => updateQty(item.id, -1)} style={{ background: "#2a2a2a", border: "none", color: "white", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>−</button>
                    <span style={{ color: "white", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, minWidth: 16, textAlign: "center" }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} style={{ background: "#e63232", border: "none", color: "white", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: 24, borderTop: "1px solid #1f1f1f" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "#666", fontFamily: "'DM Sans', sans-serif" }}>Subtotal</span>
                <span style={{ color: "white", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>₹{cart.reduce((s, c) => s + c.price * c.qty, 0)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ color: "#666", fontFamily: "'DM Sans', sans-serif" }}>Delivery</span>
                <span style={{ color: deliveryFree ? "#22c55e" : "#e63232", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{deliveryFree ? "FREE 🎉" : "₹40"}</span>
              </div>
              <button onClick={placeOrder} style={{ width: "100%", background: "#e63232", border: "none", borderRadius: 12, padding: 16, color: "white", fontSize: 22, letterSpacing: 2, cursor: "pointer", fontFamily: "'Bebas Neue', sans-serif" }}>
                PLACE ORDER · ₹{cart.reduce((s, c) => s + c.price * c.qty, 0) + (deliveryFree ? 0 : 40)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ background: "#050505", borderTop: "1px solid #1f1f1f", padding: "40px 24px", textAlign: "center" }}>
        <p style={{ color: "#444", fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginBottom: 12 }}>© 2026 Grill Masters Bikaner. All rights reserved.</p>
        <Link to="/admin" style={{ color: "#222", textDecoration: "none", fontSize: 10, fontFamily: "'DM Sans', sans-serif", opacity: 0.5, transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "#444"} onMouseOut={e => e.currentTarget.style.color = "#222"}>
          Employee Login
        </Link>
      </footer>
    </div>
  );
}

function CartButton({ item, cart, addToCart, updateQty }) {
  const inCart = cart.find(c => c.id === item.id);
  if (inCart) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, border: "2px solid #e63232", borderRadius: 50, padding: "6px 12px" }}>
        <button onClick={() => updateQty(item.id, -1)} style={{ background: "none", border: "none", color: "#e63232", fontSize: 18, cursor: "pointer", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
        <span style={{ color: "white", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, minWidth: 20, textAlign: "center" }}>{inCart.qty}</span>
        <button onClick={() => updateQty(item.id, 1)} style={{ background: "#e63232", border: "none", color: "white", fontSize: 18, cursor: "pointer", width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
      </div>
    );
  }
  return (
    <button onClick={() => addToCart(item)} style={{ background: "none", border: "2px solid #2a2a2a", borderRadius: 50, padding: "8px 20px", color: "#22c55e", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}
      onMouseEnter={e => { e.target.style.borderColor = "#22c55e"; e.target.style.background = "rgba(34,197,94,0.08)"; }}
      onMouseLeave={e => { e.target.style.borderColor = "#2a2a2a"; e.target.style.background = "none"; }}>
      + ADD
    </button>
  );
}

// ============================================================
// ADMIN DASHBOARD
// ============================================================
function AdminDashboard({ menu, orders, stats, adminTab, setAdminTab, editingPrice, setEditingPrice, updateMenuPrice, toggleAvailability, updateOrderStatus }) {
  const statusColors = { Pending: "#f59e0b", Preparing: "#3b82f6", Ready: "#22c55e", Delivered: "#666" };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0a0a0a", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: 240, background: "#111", borderRight: "1px solid #1f1f1f", padding: 24, display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ color: "#e63232", fontSize: 24, letterSpacing: 3 }}>GRILL MASTERS</h1>
          <p style={{ color: "#333", fontSize: 10, fontFamily: "'DM Sans', sans-serif", letterSpacing: 2, marginTop: 2 }}>OWNER PANEL</p>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {[
            { id: "dashboard", label: "Dashboard", icon: "📊" },
            { id: "orders", label: "Live Orders", icon: "🔴" },
            { id: "menu", label: "Menu & Prices", icon: "🍔" },
            { id: "analytics", label: "Analytics", icon: "📈" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setAdminTab(tab.id)} style={{ background: adminTab === tab.id ? "#1a1a1a" : "none", border: adminTab === tab.id ? "1px solid #2a2a2a" : "1px solid transparent", borderRadius: 10, padding: "12px 16px", color: adminTab === tab.id ? "white" : "#555", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer", textAlign: "left", display: "flex", gap: 10, alignItems: "center", transition: "all 0.2s" }}>
              <span>{tab.icon}</span>{tab.label}
              {tab.id === "orders" && stats.pendingOrders > 0 && <span style={{ background: "#e63232", color: "white", borderRadius: 50, padding: "1px 7px", fontSize: 11, marginLeft: "auto" }}>{stats.pendingOrders}</span>}
            </button>
          ))}
        </nav>
        <div style={{ borderTop: "1px solid #1f1f1f", paddingTop: 16 }}>
          <p style={{ color: "#333", fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}>🟢 System Online</p>
          <p style={{ color: "#222", fontSize: 11, fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>SuperDB Connected</p>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflowY: "auto", padding: 32 }}>

        {/* DASHBOARD */}
        {adminTab === "dashboard" && (
          <div className="fade-in">
            <h2 style={{ color: "white", fontSize: 36, letterSpacing: 3, marginBottom: 8 }}>DASHBOARD</h2>
            <p style={{ color: "#444", fontFamily: "'DM Sans', sans-serif", marginBottom: 32 }}>Friday, {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
              {[
                { label: "Total Orders", value: stats.totalOrders, icon: "📦", color: "#e63232" },
                { label: "Revenue Today", value: `₹${stats.totalRevenue}`, icon: "💰", color: "#f59e0b" },
                { label: "Pending Orders", value: stats.pendingOrders, icon: "⏳", color: "#3b82f6" },
                { label: "Menu Items", value: stats.menuItems, icon: "🍔", color: "#22c55e" },
              ].map(stat => (
                <div key={stat.label} style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, padding: 24 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
                  <div style={{ color: stat.color, fontSize: 32, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>{stat.value}</div>
                  <div style={{ color: "#555", fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, padding: 24 }}>
              <h3 style={{ color: "white", fontSize: 20, letterSpacing: 2, marginBottom: 16 }}>RECENT ORDERS</h3>
              {orders.slice(0, 5).map(order => (
                <div key={order.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #1a1a1a" }}>
                  <div>
                    <span style={{ color: "#e63232", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, marginRight: 12 }}>{order.id}</span>
                    <span style={{ color: "#666", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>{order.customer} · {order.time}</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ color: "white", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>₹{order.total}</span>
                    <span style={{ background: statusColors[order.status] + "22", color: statusColors[order.status], padding: "3px 10px", borderRadius: 50, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LIVE ORDERS */}
        {adminTab === "orders" && (
          <div className="fade-in">
            <h2 style={{ color: "white", fontSize: 36, letterSpacing: 3, marginBottom: 32 }}>LIVE ORDERS</h2>
            <div style={{ display: "grid", gap: 16 }}>
              {orders.map(order => (
                <div key={order.id} style={{ background: "#111", border: `1px solid ${statusColors[order.status]}33`, borderLeft: `4px solid ${statusColors[order.status]}`, borderRadius: 16, padding: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <span style={{ color: "#e63232", fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 18 }}>{order.id}</span>
                      <span style={{ color: "#444", fontFamily: "'DM Sans', sans-serif", marginLeft: 12, fontSize: 13 }}>{order.customer} · {order.time}</span>
                    </div>
                    <span style={{ background: statusColors[order.status], color: "white", padding: "4px 14px", borderRadius: 50, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13 }}>{order.status}</span>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    {order.items.map((item, i) => (
                      <span key={i} style={{ color: "#888", fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginRight: 12 }}>{item.qty}× {item.name}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "white", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 20 }}>₹{order.total}</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      {["Pending", "Preparing", "Ready", "Delivered"].map(s => (
                        <button key={s} onClick={() => updateOrderStatus(order.id, s)} style={{ padding: "6px 14px", background: order.status === s ? statusColors[s] : "#1a1a1a", border: `1px solid ${statusColors[s]}55`, borderRadius: 50, color: order.status === s ? "white" : "#666", fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>{s}</button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MENU MANAGEMENT */}
        {adminTab === "menu" && (
          <div className="fade-in">
            <h2 style={{ color: "white", fontSize: 36, letterSpacing: 3, marginBottom: 32 }}>MENU MANAGEMENT</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {menu.map(item => (
                <div key={item.id} style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 14, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", opacity: item.available ? 1 : 0.5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 24 }}>{item.emoji}</span>
                    <div>
                      <p style={{ color: "white", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{item.name}</p>
                      <p style={{ color: "#444", fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>{item.category} · {item.orders} orders</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "#444", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>₹</span>
                      <input type="number" defaultValue={item.price} onChange={e => setEditingPrice(p => ({ ...p, [item.id]: e.target.value }))} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "6px 10px", color: "white", fontFamily: "'DM Sans', sans-serif", width: 80, fontSize: 14, outline: "none" }} />
                      {editingPrice[item.id] && <button onClick={() => updateMenuPrice(item.id)} style={{ background: "#e63232", border: "none", borderRadius: 8, padding: "6px 14px", color: "white", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Save</button>}
                    </div>
                    <button onClick={() => toggleAvailability(item.id)} style={{ background: item.available ? "#22c55e22" : "#1a1a1a", border: `1px solid ${item.available ? "#22c55e" : "#333"}`, borderRadius: 50, padding: "6px 14px", color: item.available ? "#22c55e" : "#555", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                      {item.available ? "● Available" : "○ Hidden"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {adminTab === "analytics" && (
          <div className="fade-in">
            <h2 style={{ color: "white", fontSize: 36, letterSpacing: 3, marginBottom: 32 }}>ANALYTICS</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, padding: 24 }}>
                <h3 style={{ color: "white", fontSize: 18, letterSpacing: 2, marginBottom: 20 }}>TOP SELLING ITEMS</h3>
                {menu.sort((a, b) => b.orders - a.orders).slice(0, 7).map((item, i) => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <span style={{ color: "#444", fontFamily: "'DM Sans', sans-serif", width: 20, fontSize: 12 }}>#{i + 1}</span>
                    <span style={{ fontSize: 18 }}>{item.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ color: "#ccc", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>{item.name}</span>
                        <span style={{ color: "#e63232", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700 }}>{item.orders}</span>
                      </div>
                      <div style={{ background: "#1a1a1a", borderRadius: 4, height: 4, overflow: "hidden" }}>
                        <div style={{ background: i === 0 ? "#e63232" : "#333", width: `${(item.orders / menu[0]?.orders || 1) * 100}%`, height: "100%", borderRadius: 4 }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, padding: 24 }}>
                  <h3 style={{ color: "white", fontSize: 18, letterSpacing: 2, marginBottom: 16 }}>BY CATEGORY</h3>
                  {["Burgers", "Sandwiches", "Pizzas", "Noodles", "Combos", "Shakespeares", "Sides"].map(cat => {
                    const catItems = menu.filter(i => i.category === cat);
                    const catOrders = catItems.reduce((s, i) => s + i.orders, 0);
                    return (
                      <div key={cat} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                        <span style={{ color: "#888", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>{cat}</span>
                        <span style={{ color: "white", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{catOrders} orders</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, padding: 24 }}>
                  <h3 style={{ color: "white", fontSize: 18, letterSpacing: 2, marginBottom: 16 }}>REVENUE SPLIT</h3>
                  {["Burgers", "Pizzas", "Shakespeares", "Combos"].map((cat, i) => {
                    const colors = ["#e63232", "#f59e0b", "#22c55e", "#3b82f6"];
                    const pct = [35, 25, 22, 18][i];
                    return (
                      <div key={cat} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ color: "#888", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>{cat}</span>
                          <span style={{ color: colors[i], fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700 }}>{pct}%</span>
                        </div>
                        <div style={{ background: "#1a1a1a", borderRadius: 4, height: 6, overflow: "hidden" }}>
                          <div style={{ background: colors[i], width: `${pct}%`, height: "100%", borderRadius: 4 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
