"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getTotalPrice, getTotalItems } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    // Customer Details
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    
    // Billing Address
    address: "",
    city: "",
    state: "",
    postcode: "",
    country: "MY",
    
    // Additional
    notes: "",
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      router.push("/cart");
    }
  }, [cart, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      console.log('Submitting checkout...');
      console.log('Customer:', formData.email);
      console.log('Cart items:', cart.length);
      console.log('Total:', getTotalPrice());

      // Create payment with CHIP
      const response = await fetch('/api/chip/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerDetails: formData,
          cartItems: cart,
          totalAmount: getTotalPrice(),
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success && data.checkoutUrl) {
        console.log('✅ Payment created, redirecting to:', data.checkoutUrl);
        // Redirect to CHIP payment page
        window.location.href = data.checkoutUrl;
      } else {
        console.error('❌ Payment creation failed:', data);
        const errorMessage = data.details 
          ? `Payment creation failed: ${JSON.stringify(data.details)}` 
          : data.message || 'Payment creation failed. Please try again.';
        alert(errorMessage);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('💥 Checkout error:', error);
      alert(`An error occurred: ${error instanceof Error ? error.message : 'Please try again'}`);
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <main className="main">
      {/* Page Title */}
      <div className="page-title" data-aos="fade">
        <div className="container">
          <nav className="breadcrumbs">
            <ol>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/store">Store</Link></li>
              <li><Link href="/cart">Cart</Link></li>
              <li className="current">Checkout</li>
            </ol>
          </nav>
          <h1>Checkout</h1>
        </div>
      </div>

      {/* Checkout Section */}
      <section className="section">
        <div className="container">
          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Billing Details */}
              <div className="col-lg-8">
                <div className="card mb-4">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0"><i className="bi bi-person me-2"></i>Billing Details</h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">First Name <span className="text-danger">*</span></label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="firstName" 
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Last Name <span className="text-danger">*</span></label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="lastName" 
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Email <span className="text-danger">*</span></label>
                        <input 
                          type="email" 
                          className="form-control" 
                          name="email" 
                          value={formData.email}
                          onChange={handleInputChange}
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Phone <span className="text-danger">*</span></label>
                        <input 
                          type="tel" 
                          className="form-control" 
                          name="phone" 
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+60123456789"
                          required 
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Address <span className="text-danger">*</span></label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="address" 
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Street address"
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">City <span className="text-danger">*</span></label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="city" 
                          value={formData.city}
                          onChange={handleInputChange}
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">State <span className="text-danger">*</span></label>
                        <select 
                          className="form-select" 
                          name="state" 
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select State</option>
                          <option value="Johor">Johor</option>
                          <option value="Kedah">Kedah</option>
                          <option value="Kelantan">Kelantan</option>
                          <option value="Kuala Lumpur">Kuala Lumpur</option>
                          <option value="Labuan">Labuan</option>
                          <option value="Malacca">Malacca</option>
                          <option value="Negeri Sembilan">Negeri Sembilan</option>
                          <option value="Pahang">Pahang</option>
                          <option value="Penang">Penang</option>
                          <option value="Perak">Perak</option>
                          <option value="Perlis">Perlis</option>
                          <option value="Putrajaya">Putrajaya</option>
                          <option value="Sabah">Sabah</option>
                          <option value="Sarawak">Sarawak</option>
                          <option value="Selangor">Selangor</option>
                          <option value="Terengganu">Terengganu</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Postcode <span className="text-danger">*</span></label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="postcode" 
                          value={formData.postcode}
                          onChange={handleInputChange}
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Country</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value="Malaysia" 
                          disabled 
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Order Notes (Optional)</label>
                        <textarea 
                          className="form-control" 
                          name="notes" 
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows={3}
                          placeholder="Notes about your order, e.g. special delivery instructions"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="col-lg-4">
                <div className="card sticky-top" style={{ top: "100px" }}>
                  <div className="card-header bg-light">
                    <h5 className="mb-0">Order Summary</h5>
                  </div>
                  <div className="card-body">
                    {/* Cart Items */}
                    <div className="mb-3">
                      {cart.map((item, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-start mb-2 pb-2 border-bottom">
                          <div className="flex-grow-1">
                            <h6 className="mb-1 small">{item.name}</h6>
                            <small className="text-muted">Qty: {item.quantity}</small>
                          </div>
                          <div className="text-end">
                            <small className="fw-bold">
                              {item.priceLabel || formatPrice(item.price * item.quantity)}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>

                    <hr />

                    {/* Totals */}
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal ({getTotalItems()} items)</span>
                      <span className="fw-bold">{formatPrice(getTotalPrice())}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">Shipping</span>
                      <span className="text-muted small">To be calculated</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between mb-4">
                      <span className="h5">Total</span>
                      <span className="h5 text-primary">{formatPrice(getTotalPrice())}</span>
                    </div>

                    {/* Payment Info */}
                    <div className="alert alert-info small mb-3">
                      <i className="bi bi-shield-check me-2"></i>
                      <strong>Secure Payment</strong>
                      <p className="mb-0 mt-1">Powered by CHIP - Malaysia&apos;s trusted payment gateway</p>
                    </div>

                    {/* Submit Button */}
                    <div className="d-grid gap-2">
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-lg" 
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-credit-card me-2"></i>
                            Place Order
                          </>
                        )}
                      </button>
                      <Link href="/cart" className="btn btn-outline-secondary">
                        <i className="bi bi-arrow-left me-2"></i>Back to Cart
                      </Link>
                    </div>

                    <div className="mt-3 text-center">
                      <small className="text-muted">
                        By placing your order, you agree to our{" "}
                        <Link href="/terms-of-use" className="text-primary">Terms &amp; Conditions</Link>
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

