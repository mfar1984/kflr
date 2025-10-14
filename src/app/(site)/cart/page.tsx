"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart();
  const [isClient, setIsClient] = useState(false);

  // Ensure component is mounted on client
  useState(() => {
    setIsClient(true);
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  if (!isClient) {
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
              <li className="current">Shopping Cart</li>
            </ol>
          </nav>
          <h1>Shopping Cart</h1>
        </div>
      </div>

      {/* Cart Section */}
      <section className="section">
        <div className="container">
          {cart.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-cart-x display-1 text-muted mb-4"></i>
              <h3 className="mb-3">Your cart is empty</h3>
              <p className="text-muted mb-4">Add some products to your cart to see them here</p>
              <Link href="/store" className="btn btn-primary">
                <i className="bi bi-shop me-2"></i>Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="row">
              {/* Cart Items */}
              <div className="col-lg-8">
                <div className="card mb-4">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0"><i className="bi bi-cart3 me-2"></i>Cart Items ({getTotalItems()})</h5>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="bg-light">
                          <tr>
                            <th style={{ width: "15%" }}>Image</th>
                            <th style={{ width: "30%" }}>Product</th>
                            <th style={{ width: "20%" }}>Price</th>
                            <th style={{ width: "20%" }}>Quantity</th>
                            <th style={{ width: "15%" }}>Total</th>
                            <th style={{ width: "5%" }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {cart.map((item, index) => (
                            <tr key={index}>
                              <td>
                                <img 
                                  src={item.image} 
                                  alt={item.name} 
                                  className="img-fluid rounded" 
                                  style={{ maxHeight: "80px", objectFit: "contain" }} 
                                />
                              </td>
                              <td>
                                <h6 className="mb-1">{item.name}</h6>
                                {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                  <div className="small text-muted">
                                    {Object.entries(item.selectedOptions).map(([key, value]) => (
                                      <div key={key}>
                                        <strong>{key}:</strong> {value}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                              <td>
                                {item.priceLabel || formatPrice(item.price)}
                              </td>
                              <td>
                                <div className="input-group" style={{ maxWidth: "120px" }}>
                                  <button 
                                    className="btn btn-outline-secondary btn-sm" 
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  >
                                    <i className="bi bi-dash"></i>
                                  </button>
                                  <input 
                                    type="number" 
                                    className="form-control form-control-sm text-center" 
                                    value={item.quantity}
                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                    min="1"
                                  />
                                  <button 
                                    className="btn btn-outline-secondary btn-sm" 
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  >
                                    <i className="bi bi-plus"></i>
                                  </button>
                                </div>
                              </td>
                              <td className="fw-bold">
                                {item.priceLabel ? "Contact for Price" : formatPrice(item.price * item.quantity)}
                              </td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => removeFromCart(item.id)}
                                  title="Remove from cart"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Continue Shopping */}
                <Link href="/store" className="btn btn-outline-primary">
                  <i className="bi bi-arrow-left me-2"></i>Continue Shopping
                </Link>
              </div>

              {/* Cart Summary */}
              <div className="col-lg-4">
                <div className="card sticky-top" style={{ top: "100px" }}>
                  <div className="card-header bg-light">
                    <h5 className="mb-0">Order Summary</h5>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal ({getTotalItems()} items)</span>
                      <span className="fw-bold">{formatPrice(getTotalPrice())}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">Shipping</span>
                      <span className="text-muted small">Calculated at checkout</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between mb-4">
                      <span className="h5">Total</span>
                      <span className="h5 text-primary">{formatPrice(getTotalPrice())}</span>
                    </div>
                    
                    <div className="d-grid gap-2">
                      <Link href="/checkout" className="btn btn-primary btn-lg">
                        <i className="bi bi-credit-card me-2"></i>Proceed to Checkout
                      </Link>
                      <Link href="/request-quotation" className="btn btn-outline-secondary">
                        <i className="bi bi-envelope me-2"></i>Request Quotation
                      </Link>
                    </div>

                    <div className="alert alert-info mt-4 mb-0 small">
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>Note:</strong> For products with &quot;Contact for Price&quot;, please request a quotation or contact our sales team.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="section bg-light">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-3 mb-3">
              <i className="bi bi-shield-check display-4 text-primary mb-2"></i>
              <h6>Secure Payment</h6>
              <p className="small text-muted">Your payment information is secure</p>
            </div>
            <div className="col-md-3 mb-3">
              <i className="bi bi-truck display-4 text-primary mb-2"></i>
              <h6>Fast Delivery</h6>
              <p className="small text-muted">Quick and reliable shipping</p>
            </div>
            <div className="col-md-3 mb-3">
              <i className="bi bi-arrow-repeat display-4 text-primary mb-2"></i>
              <h6>Easy Returns</h6>
              <p className="small text-muted">30-day return policy</p>
            </div>
            <div className="col-md-3 mb-3">
              <i className="bi bi-headset display-4 text-primary mb-2"></i>
              <h6>24/7 Support</h6>
              <p className="small text-muted">We&apos;re here to help</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

