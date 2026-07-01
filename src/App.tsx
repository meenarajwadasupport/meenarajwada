import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { WishlistProvider } from '@/contexts/WishlistContext'
import Layout from '@/components/layout/Layout'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import AppErrorBoundary from '@/components/common/AppErrorBoundary'
import ScrollToTop from '@/components/common/ScrollToTop'

// Pages
import Index from '@/pages/Index'
import Shop from '@/pages/Shop'
import CategoryPage from '@/pages/CategoryPage'
import ProductDetail from '@/pages/ProductDetail'
import CartPage from '@/pages/CartPage'
import CheckoutPage from '@/pages/CheckoutPage'
import PaymentStatus from '@/pages/PaymentStatus'
import OrderConfirmation from '@/pages/OrderConfirmation'
import MyOrders from '@/pages/MyOrders'
import TrackOrder from '@/pages/TrackOrder'
import Account from '@/pages/Account'
import AuthPage from '@/pages/AuthPage'
import WishlistPage from '@/pages/WishlistPage'
import CustomizePage from '@/pages/CustomizePage'
import BlogPage from '@/pages/BlogPage'
import BlogPost from '@/pages/BlogPost'
import OurStory from '@/pages/OurStory'
import ContactPage from '@/pages/ContactPage'
import FAQ from '@/pages/FAQ'
import ShippingPolicy from '@/pages/ShippingPolicy'
import ReturnPolicy from '@/pages/ReturnPolicy'
import PrivacyPolicy from '@/pages/PrivacyPolicy'
import Terms from '@/pages/Terms'
import NotFound from '@/pages/NotFound'

// Admin Pages
import AdminLayout from '@/pages/admin/AdminLayout'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminProducts from '@/pages/admin/AdminProducts'
import AdminOrders from '@/pages/admin/AdminOrders'
import AdminCategories from '@/pages/admin/AdminCategories'
import AdminTestimonials from '@/pages/admin/AdminTestimonials'
import AdminBlog from '@/pages/admin/AdminBlog'
import AdminHeroSlider from '@/pages/admin/AdminHeroSlider'
import AdminSiteSettings from '@/pages/admin/AdminSiteSettings'
import AdminMessages from '@/pages/admin/AdminMessages'
import AdminNewsletter from '@/pages/admin/AdminNewsletter'
import AdminCustomOrders from '@/pages/admin/AdminCustomOrders'
import AdminFaqs from '@/pages/admin/AdminFaqs'
import AdminPromos from '@/pages/admin/AdminPromos'
import AdminInstagram from '@/pages/admin/AdminInstagram'

export default function App() {
  return (
    <AppErrorBoundary>
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="shop" element={<Shop />} />
                <Route path="category/:slug" element={<CategoryPage />} />
                <Route path="product/:slug" element={<ProductDetail />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="payment-status" element={<PaymentStatus />} />
                <Route path="order-confirmation" element={<OrderConfirmation />} />
                <Route path="track-order" element={<TrackOrder />} />
                <Route path="auth" element={<AuthPage />} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="customize" element={<CustomizePage />} />
                <Route path="blog" element={<BlogPage />} />
                <Route path="blog/:slug" element={<BlogPost />} />
                <Route path="our-story" element={<OurStory />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="faq" element={<FAQ />} />
                <Route path="shipping-policy" element={<ShippingPolicy />} />
                <Route path="return-policy" element={<ReturnPolicy />} />
                <Route path="privacy-policy" element={<PrivacyPolicy />} />
                <Route path="terms-conditions" element={<Terms />} />
                <Route path="my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                <Route path="account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
              </Route>

              {/* Admin routes */}
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="testimonials" element={<AdminTestimonials />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="hero-slider" element={<AdminHeroSlider />} />
                <Route path="site-settings" element={<AdminSiteSettings />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="newsletter" element={<AdminNewsletter />} />
                <Route path="custom-orders" element={<AdminCustomOrders />} />
                <Route path="faqs" element={<AdminFaqs />} />
                <Route path="promos" element={<AdminPromos />} />
                <Route path="instagram" element={<AdminInstagram />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
    </AppErrorBoundary>
  )
}
