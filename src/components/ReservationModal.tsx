import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { FiCheck, FiX, FiAlertCircle } from "react-icons/fi";

import { addReservation, getShiftsForDate } from "../services/ReservationAPI";
import { useTranslation } from "react-i18next";
import CustomDatePicker from "./CustomDatePicker";
import CustomTimeSelect from "./CustomTimeSelect";
import CustomPeopleSelect from "./CustomPeopleSelect";
import CustomPhoneInput from "./CustomPhoneInput";

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  countryCode: string;
  email: string;
  date: string;
  time: string;
  seats: number;
  specialRequests?: string;
}

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    countryCode: "+39",
    email: "",
    date: "",
    time: "",
    seats: 1,
    specialRequests: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Stato per memorizzare le fasce orarie disponibili per la data selezionata
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  useEffect(() => {
    const loadAvailableTimes = async () => {
      if (formData.date) {
        try {
          const shifts = await getShiftsForDate(formData.date);
          // Filtriamo solo gli shift abilitati
          const available = shifts.filter((shift) => shift.enabled).map((shift) => shift.time);
          setAvailableTimeSlots(available);
          // Se l'orario selezionato non è più disponibile, lo resettiamo
          if (!available.includes(formData.time)) {
            setFormData((prev) => ({ ...prev, time: "" }));
          }
        } catch (error) {
          console.error("Error loading available times", error);
          setAvailableTimeSlots([]);
        }
      } else {
        setAvailableTimeSlots([]);
      }
    };

    loadAvailableTimes();
  }, [formData.date, formData.time]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = t("reservationModal.error.firstNameRequired");
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = t("reservationModal.error.lastNameRequired");
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t("reservationModal.error.phoneRequired");
    }
    if (!formData.email.trim()) {
      newErrors.email = t("reservationModal.error.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = t("reservationModal.error.emailInvalid");
    }
    if (!formData.date) {
      newErrors.date = t("reservationModal.error.dateRequired");
    }
    if (!formData.time) {
      newErrors.time = t("reservationModal.error.timeRequired");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const fullName = `${formData.firstName} ${formData.lastName}`;
        const reservation = {
          fullName,
          phone: formData.phone,
          countryCode: formData.countryCode,
          email: formData.email,
          date: formData.date,
          time: formData.time,
          seats: formData.seats,
          specialRequests: formData.specialRequests,
          status: 'pending' as const
        };
        await addReservation(reservation);
        setShowSuccess(true);
      } catch (error: any) {
        console.error("Error:", error);
        setErrorMessage(error.message || t("reservationModal.error.general"));
        setShowError(true);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "seats" ? Number(value) : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-2 z-[200] overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md mx-auto bg-card rounded-lg shadow-lg p-4 sm:p-6 my-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-lg sm:text-xl font-heading text-accent">
            {t("reservationModal.title")}
          </p>
          <button onClick={onClose} className="text-accent hover:text-foreground transition-colors">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo Nome */}
          <div>
            <label className="block text-sm font-body text-foreground mb-2">
              {t("reservationModal.firstNameLabel")}
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 rounded-md border ${
                errors.firstName ? "border-destructive" : "border-input"
              } focus:outline-none focus:ring-2 focus:ring-ring`}
              placeholder={t("reservationModal.firstNamePlaceholder")}
            />
            {errors.firstName && <p className="mt-1 text-sm text-destructive">{errors.firstName}</p>}
          </div>

          {/* Campo Cognome */}
          <div>
            <label className="block text-sm font-body text-foreground mb-2">
              {t("reservationModal.lastNameLabel")}
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 rounded-md border ${
                errors.lastName ? "border-destructive" : "border-input"
              } focus:outline-none focus:ring-2 focus:ring-ring`}
              placeholder={t("reservationModal.lastNamePlaceholder")}
            />
            {errors.lastName && <p className="mt-1 text-sm text-destructive">{errors.lastName}</p>}
          </div>

          {/* Numero di Telefono */}
          <CustomPhoneInput
            value={formData.phone}
            countryCode={formData.countryCode}
            onPhoneChange={(phone) => {
              setFormData((prev) => ({ ...prev, phone }));
              if (errors.phone) {
                setErrors((prev) => ({ ...prev, phone: "" }));
              }
            }}
            onCountryCodeChange={(countryCode) => {
              setFormData((prev) => ({ ...prev, countryCode }));
            }}
            error={errors.phone}
            label={t("reservationModal.phoneLabel")}
            placeholder={t("reservationModal.phonePlaceholder")}
          />

          {/* Campo Email */}
          <div>
            <label className="block text-sm font-body text-foreground mb-2">
              {t("reservationModal.emailLabel")}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 rounded-md border ${
                errors.email ? "border-destructive" : "border-input"
              } focus:outline-none focus:ring-2 focus:ring-ring`}
              placeholder={t("reservationModal.emailPlaceholder")}
            />
            {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Campo Data */}
            <CustomDatePicker
              value={formData.date}
              onChange={(date) => {
                setFormData((prev) => ({ ...prev, date }));
                if (errors.date) {
                  setErrors((prev) => ({ ...prev, date: "" }));
                }
              }}
              error={errors.date}
              label={t("reservationModal.dateLabel")}
              placeholder={t("reservationModal.selectDate")}
            />

            {/* Campo Ora */}
            <CustomTimeSelect
              value={formData.time}
              onChange={(time) => {
                setFormData((prev) => ({ ...prev, time }));
                if (errors.time) {
                  setErrors((prev) => ({ ...prev, time: "" }));
                }
              }}
              options={availableTimeSlots}
              error={errors.time}
              label={t("reservationModal.timeLabel")}
              placeholder={t("reservationModal.timePlaceholder")}
            />
          </div>

          {/* Numero di Persone */}
          <CustomPeopleSelect
            value={formData.seats}
            onChange={(seats) => {
              setFormData((prev) => ({ ...prev, seats }));
            }}
            label={t("reservationModal.peopleLabel")}
            min={1}
            max={10}
          />

          {/* Richieste Speciali */}
          <div>
            <label className="block text-sm font-body text-foreground mb-2">
              {t("reservationModal.specialRequestsLabel")}
            </label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-ring h-24"
              placeholder={t("reservationModal.specialRequestsPlaceholder")}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md font-body hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t("reservationModal.submitting") : t("reservationModal.submitButton")}
          </button>
        </form>
      </div>

      {/* Modal di Successo */}
      {showSuccess && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-2 z-50">
          <div className="transform scale-90 sm:scale-100 bg-card p-4 sm:p-6 rounded-lg shadow-lg max-w-sm w-full">
            <div className="mb-4 text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <FiCheck className="text-primary text-xl" />
              </div>
              <h2 className="text-lg sm:text-xl font-heading text-foreground mb-2">
                {t("reservationModal.successTitle")}
              </h2>
              <p className="text-accent text-sm">
                {t("reservationModal.successMessage")}
              </p>
              <p className="text-accent text-sm">
                {t("reservationModal.holdTimeMessage")}
              </p>
            </div>
            <div className="space-y-2 mb-4">
              <p className="text-sm">
                <strong>{t("reservationModal.firstNameLabel")}:</strong> {formData.firstName} {formData.lastName}
              </p>
              <p className="text-sm">
                <strong>{t("reservationModal.dateLabel")}:</strong> {formData.date}
              </p>
              <p className="text-sm">
                <strong>{t("reservationModal.timeLabel")}:</strong> {formData.time}
              </p>
              <p className="text-sm">
                <strong>{t("reservationModal.peopleLabel")}:</strong> {formData.seats}
              </p>
            </div>
            <button
              onClick={() => {
                setShowSuccess(false);
                onClose();
              }}
              className="w-full bg-primary text-primary-foreground py-2 rounded-md font-body hover:bg-primary/90 transition-colors"
            >
              {t("reservationModal.closeButton")}
            </button>
          </div>
        </div>
      )}

      {/* Modal di Errore */}
      {showError && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-2 z-50">
          <div className="transform scale-90 sm:scale-100 bg-card p-4 sm:p-6 rounded-lg shadow-lg max-w-sm w-full border border-destructive">
            <div className="mb-4 text-center">
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <FiAlertCircle className="text-destructive text-xl" />
              </div>
              <h2 className="text-lg sm:text-xl font-heading text-foreground mb-2">
                {t("reservationModal.errorTitle")}
              </h2>
              <p className="text-destructive text-sm">
                {errorMessage}
              </p>
              <p className="text-primary text-sm">
                {t("reservationModal.contactInfo")}
              </p>
            </div>
            <button
              onClick={() => setShowError(false)}
              className="w-full bg-destructive text-white py-2 rounded-md font-body hover:bg-destructive/90 transition-colors"
            >
              {t("reservationModal.closeButton")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationModal;