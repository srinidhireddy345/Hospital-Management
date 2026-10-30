import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { createHealthPackageBooking } from "../../services/healthPackageService";
import { createAppointment } from "../../services/appointmentService";
import { createNotification, notifyAllReceptionists, notifyPatient, notifyDoctor } from "../../services/notificationService";
import { formatDoctorName, formatDateDisplay } from "../../data/doctors";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, CheckCircle, XCircle, CreditCard, Smartphone, Banknote, Building2 } from "lucide-react";

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [bookingData, setBookingData] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [status, setStatus] = useState("FORM"); // FORM, PROCESSING, VERIFYING, SUCCESS, FAILED
  const [transactionId, setTransactionId] = useState("");
  const [error, setError] = useState("");

  // Payment Form States
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [bank, setBank] = useState("");

  useEffect(() => {
    if (location.state && location.state.bookingData && location.state.selectedPackage) {
      setBookingData(location.state.bookingData);
      setSelectedPackage(location.state.selectedPackage);
    } else {
      navigate("/patient/dashboard");
    }
  }, [location, navigate]);

  if (!bookingData || !selectedPackage) return null;

  const numericPrice = parseFloat(selectedPackage.price.replace(/[^\d.-]/g, '')) || 0;
  const qrString = `upi://pay?pa=mediconnect@upi&pn=MediConnect&am=${numericPrice}&cu=INR`;
  const isQRMethod = ["UPI", "Paytm", "PhonePe", "Google Pay"].includes(paymentMethod);

  const handlePayment = async (e) => {
    if (e) e.preventDefault();
    
    setError("");
    // Basic validation
    if (paymentMethod === "Card" && (!cardNumber || !cardHolder || !expiry || !cvv)) return setError("Please fill all card details");
    if (paymentMethod === "Net Banking" && !bank) return setError("Please select a bank");

    setStatus(isQRMethod ? "VERIFYING" : "PROCESSING");
    
    // Simulate network delay for payment processing or verification
    setTimeout(async () => {
      try {
        const generatedTxnId = `DEMO-TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
        setTransactionId(generatedTxnId);
        
        const finalPaymentStatus = paymentMethod === "Cash at Hospital" ? "PAY_AT_HOSPITAL" : "SUCCESS";
        const finalBookingStatus = "Confirmed";
        const generatedBookingId = `BK-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const commonData = {
          bookingId: generatedBookingId,
          bookingStatus: finalBookingStatus,
          status: finalBookingStatus,
          paymentMethod,
          paymentStatus: finalPaymentStatus,
          transactionId: paymentMethod === "Cash at Hospital" ? "N/A" : generatedTxnId,
        };

        if (selectedPackage.type === "appointment") {
          await createAppointment({
            ...bookingData,
            ...commonData,
          });
          
          const formattedDocName = formatDoctorName(bookingData.doctorName);
          const formattedDate = formatDateDisplay(bookingData.date);

          // 1. Notify Patient:
          if (bookingData.patientId) {
            await notifyPatient(
              bookingData.patientId,
              `Your appointment with ${formattedDocName} on ${formattedDate} at ${bookingData.timeSlot} has been successfully booked.`,
              { type: "appointment_booked" }
            );
          }
          
          // 2. Notify Doctor:
          if (bookingData.doctorId) {
            await notifyDoctor(
              bookingData.doctorId,
              `New appointment booked: Patient ${bookingData.patientName} on ${formattedDate} at ${bookingData.timeSlot} (${bookingData.department || ""} • ${bookingData.location || ""}).`,
              { type: "appointment_booked", doctorName: bookingData.doctorName }
            );
          }

          // 3. Notify Receptionists:
          await notifyAllReceptionists(
            `New appointment booked: Patient ${bookingData.patientName} with ${formattedDocName} on ${formattedDate} at ${bookingData.timeSlot}.`,
            { type: "appointment_booked" }
          );
        } else {
          await createHealthPackageBooking({
            ...bookingData,
            ...commonData,
            status: finalBookingStatus
          });
        }
        
        setStatus("SUCCESS");
      } catch (error) {
        console.error("Payment failed", error);
        setStatus("FAILED");
      }
    }, 2000);
  };

  if (status === "PROCESSING" || status === "VERIFYING") {
    return (
      <div className="min-h-screen bg-slate-50 py-12 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-medical-primary mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-800 animate-pulse">
          {status === "VERIFYING" ? "Payment Verification" : "Processing Payment..."}
        </h2>
        <p className="text-gray-500 mt-2">
          {status === "VERIFYING" ? "Checking payment status..." : "Please do not close or refresh this page."}
        </p>
      </div>
    );
  }

  if (status === "SUCCESS") {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center animate-in zoom-in">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful</h2>
          <p className="text-gray-600 mb-8">Your payment has been successfully processed.</p>
          
          <div className="bg-slate-50 p-6 rounded-lg text-left border border-gray-200 mb-8 max-w-md mx-auto">
            <h3 className="text-center font-bold text-lg text-medical-dark mb-4 border-b pb-2">MediConnect<br/><span className="text-sm font-normal text-gray-500">Booking Receipt</span></h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Transaction ID</span><span className="font-semibold">{transactionId}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Patient Name</span><span className="font-semibold">{bookingData.patientName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">{selectedPackage.type === "appointment" ? "Doctor" : "Package"}</span><span className="font-semibold text-right">{selectedPackage.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Amount Paid</span><span className="font-bold text-medical-primary">{selectedPackage.price}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium">{bookingData.preferredDate}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Time</span><span className="font-medium">{bookingData.preferredTime}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Payment Method</span><span className="font-medium">{paymentMethod}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Payment Status</span><span className="font-bold text-green-600">{paymentMethod === "Cash at Hospital" ? "PAY AT HOSPITAL" : "SUCCESS"}</span></div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={selectedPackage.type === "appointment" ? "/patient/my-appointments" : "/patient/health-package-bookings"} className="bg-medical-primary text-white hover:bg-medical-dark px-6 py-3 rounded-md font-bold transition-colors">
              View Booking
            </Link>
            <Link to="/patient/dashboard" className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-md font-bold transition-colors">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === "FAILED") {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center animate-in zoom-in">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
          <p className="text-gray-600 mb-8">Your payment could not be completed. No charges were made.</p>
          
          <div className="flex flex-col gap-3">
            <button onClick={() => setStatus("FORM")} className="bg-medical-primary text-white hover:bg-medical-dark px-6 py-3 rounded-md font-bold transition-colors w-full">
              Try Again / Change Method
            </button>
            <button onClick={() => navigate(-1)} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-md font-bold transition-colors w-full">
              Back to Booking
            </button>
          </div>
        </div>
      </div>
    );
  }

  // FORM Status
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center text-medical-primary hover:text-medical-dark font-medium mb-6 transition-colors">
          <ArrowLeft size={20} className="mr-1" /> Back to Booking Summary
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Complete Your Payment</h1>

        {error && (
          <div className="max-w-5xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-medical-dark text-white rounded-xl shadow-md overflow-hidden sticky top-8">
              <div className="p-6 border-b border-medical-primary/30">
                <h2 className="text-xl font-bold mb-1">Payment Summary</h2>
                <p className="text-medical-light/70 text-sm">Secure Checkout</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-medical-light/70">{selectedPackage.type === "appointment" ? "Consultation" : "Package"}</p>
                  <p className="font-semibold">{selectedPackage.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-medical-light/70">Date</p>
                    <p className="font-semibold">{bookingData.preferredDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-medical-light/70">Time</p>
                    <p className="font-semibold">{bookingData.preferredTime}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-medical-light/70">Patient</p>
                  <p className="font-semibold">{bookingData.patientName}</p>
                </div>
              </div>
              <div className="p-6 bg-medical-primary/20 border-t border-medical-primary/30">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Total Amount</span>
                  <span className="text-2xl font-bold">₹{numericPrice}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3">
                {/* Methods List */}
                <div className="border-r border-gray-100 bg-gray-50 md:col-span-1">
                  <h3 className="p-4 font-bold text-gray-700 border-b border-gray-200">Select Method</h3>
                  <div className="flex flex-col">
                    {[
                      { id: "UPI", icon: Smartphone },
                      { id: "Paytm", icon: Smartphone },
                      { id: "PhonePe", icon: Smartphone },
                      { id: "Google Pay", icon: Smartphone },
                      { id: "Card", icon: CreditCard },
                      { id: "Net Banking", icon: Building2 },
                      { id: "Cash at Hospital", icon: Banknote },
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-4 text-left flex items-center gap-3 border-b border-gray-100 transition-colors
                          ${paymentMethod === method.id ? "bg-white border-l-4 border-l-medical-primary font-bold text-medical-primary" : "text-gray-600 hover:bg-gray-100 font-medium"}
                        `}
                      >
                        <method.icon size={18} className={paymentMethod === method.id ? "text-medical-primary" : "text-gray-400"} />
                        {method.id}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Forms */}
                <div className="p-6 md:col-span-2 min-h-[400px]">
                  {!paymentMethod ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <CreditCard size={48} className="mb-4 opacity-50" />
                      <p>Select a payment method from the left</p>
                    </div>
                  ) : (
                    <form onSubmit={handlePayment} className="animate-in fade-in h-full flex flex-col justify-between">
                      <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">{paymentMethod} Payment</h3>

                        {/* QR CODE FOR UPI APPS */}
                        {isQRMethod && (
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="p-4 bg-yellow-50 text-yellow-800 text-xs rounded border border-yellow-200 text-center w-full">
                              <strong>DEMO PAYMENT</strong><br />No real money will be charged.
                            </div>
                            
                            <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm flex flex-col items-center">
                              <p className="text-sm font-medium text-gray-500 mb-4">Amount: <span className="text-lg font-bold text-gray-900">₹{numericPrice}</span></p>
                              
                              <div className="bg-white p-2">
                                <QRCodeSVG value={qrString} size={200} level="H" includeMargin={true} />
                              </div>
                              
                              <div className="text-center mt-4 text-sm text-gray-600">
                                <p>Scan this QR code using:</p>
                                <p className="font-bold text-gray-800 mt-1">Google Pay / PhonePe / Paytm / any UPI app</p>
                              </div>
                            </div>
                            
                            <div className="text-center text-sm">
                              <p className="text-gray-500">UPI ID:</p>
                              <p className="font-medium">mediconnect@upi</p>
                            </div>
                            
                            <div className="text-xs text-gray-400 text-center">
                              Status: <span className="font-semibold text-yellow-600">WAITING FOR PAYMENT</span>
                            </div>
                          </div>
                        )}

                        {/* Card Form */}
                        {paymentMethod === "Card" && (
                          <div className="space-y-4">
                            <div className="p-4 bg-yellow-50 text-yellow-800 text-xs rounded border border-yellow-200">
                              <strong>Demo Warning:</strong> Do not enter real card details.
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                              <input type="text" placeholder="XXXX XXXX XXXX XXXX" value={cardNumber} onChange={e => setCardNumber(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-medical-primary" maxLength={19} />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Card Holder Name</label>
                              <input type="text" placeholder="John Doe" value={cardHolder} onChange={e => setCardHolder(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-medical-primary" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                <input type="text" placeholder="MM/YY" value={expiry} onChange={e => setExpiry(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-medical-primary" maxLength={5} />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                <input type="password" placeholder="***" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g,'').slice(0,3))} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-medical-primary" maxLength={3} />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Net Banking Form */}
                        {paymentMethod === "Net Banking" && (
                          <div className="space-y-4">
                            <div className="p-4 bg-yellow-50 text-yellow-800 text-xs rounded border border-yellow-200">
                              <strong>Demo Payment:</strong> Select a bank to simulate payment.
                            </div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Select Bank</label>
                            <div className="grid grid-cols-2 gap-3">
                              {["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank", "Bank of Baroda"].map(b => (
                                <div key={b} onClick={() => setBank(b)} className={`p-3 border rounded-lg cursor-pointer text-sm font-medium transition-colors ${bank === b ? "border-medical-primary bg-medical-primary/5 text-medical-primary" : "border-gray-200 hover:border-gray-300 text-gray-700"}`}>
                                  {b}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Cash at Hospital */}
                        {paymentMethod === "Cash at Hospital" && (
                          <div className="p-6 bg-blue-50 border border-blue-100 rounded-lg text-blue-800 text-center">
                            <Banknote size={48} className="mx-auto mb-4 opacity-70" />
                            <p className="font-medium text-lg mb-2">Pay at Reception</p>
                            <p className="text-sm">You can pay ₹{numericPrice} directly at the hospital reception during your visit. Your booking status will remain Pending until confirmed.</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-8">
                        <button type="submit" className="w-full bg-medical-primary text-white hover:bg-medical-dark py-4 rounded-xl font-bold text-lg transition-colors flex justify-center items-center gap-2 shadow-lg shadow-medical-primary/30">
                          {paymentMethod === "Cash at Hospital" ? "Confirm Booking" : isQRMethod ? "I Have Paid" : `Pay ₹${numericPrice}`}
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                          🔒 Secure Payment Gateway Simulation
                        </p>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
