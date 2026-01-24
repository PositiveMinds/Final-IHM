/**
 * Health Chat Features Module
 * Extends the Chat System with health-specific functionality
 * Features: Patient context, medical templates, consultations, appointments
 */

class HealthChatFeatures {
  constructor(chatSystem) {
    this.chatSystem = chatSystem;
    this.messageTemplates = {};
    this.consultationRequests = [];
    this.patientHealthData = {};
    this.init();
  }

  init() {
    this.loadPatientHealthData();
    this.initializeTemplates();
    this.setupHealthEventListeners();
  }

  /**
   * Load patient health data from database/localStorage
   */
  loadPatientHealthData() {
    // For now, simulate with demo data
    const demoPatients = {
      'patient_001': {
        id: 'patient_001',
        name: 'James Mwale',
        age: 45,
        sex: 'M',
        phone: '+256701234567',
        activeConditions: ['Hypertension', 'Type 2 Diabetes'],
        currentMedications: [
          { name: 'Lisinopril', dosage: '10mg', frequency: 'Daily' },
          { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' }
        ],
        allergies: ['Penicillin'],
        lastVisit: '2024-01-20',
        nextAppointment: '2024-02-03',
        bmi: 28.5,
        bloodPressure: '140/90'
      },
      'patient_002': {
        id: 'patient_002',
        name: 'Grace Nakato',
        age: 38,
        sex: 'F',
        phone: '+256702345678',
        activeConditions: ['HIV/AIDS'],
        currentMedications: [
          { name: 'AZT', dosage: '300mg', frequency: 'Twice daily' }
        ],
        allergies: [],
        lastVisit: '2024-01-18',
        nextAppointment: '2024-02-10',
        cd4Count: 450,
        viralLoad: '<50'
      }
    };

    this.patientHealthData = demoPatients;
    localStorage.setItem('patientHealthData', JSON.stringify(demoPatients));
  }

  /**
   * Initialize message templates for common health communications
   */
  initializeTemplates() {
    this.messageTemplates = {
      appointmentReminder: {
        type: 'appointment',
        template: 'Hi {patientName}, this is a reminder of your appointment on {appointmentDate} at {appointmentTime} with {healthWorkerName}. Please arrive 10 minutes early.'
      },
      
      medicationReminder: {
        type: 'health_update',
        template: 'Hi {patientName}, please remember to take your {medicationName} {frequency}. It\'s important for managing your {condition}.'
      },
      
      symptomAssessment: {
        type: 'text',
        template: 'Hi {patientName}, I\'d like to check on your recent symptoms. Can you tell me:\n1. Any changes in {symptom}?\n2. Taking medication as prescribed?\n3. Any new symptoms?\nPlease share any updates.'
      },
      
      prescriptionMessage: {
        type: 'prescription',
        template: 'Hi {patientName}, I\'m prescribing {medicationName}. Take {dosage} {frequency} for {duration}. Important: {warnings}. If you experience any side effects, please let me know immediately.'
      },
      
      followUpCheckIn: {
        type: 'health_update',
        template: 'Hi {patientName}, how have you been feeling since your last visit? Any improvements or concerns with your {condition}? Please share updates so I can help you better.'
      },
      
      labResultNotification: {
        type: 'text',
        template: 'Hi {patientName}, your recent lab results are ready. Your {testName} shows {result}. {interpretation}. Please schedule a follow-up appointment to discuss.'
      },
      
      referralMessage: {
        type: 'referral',
        template: 'Hi {patientName}, based on your condition, I recommend you see a {specialistType}. I\'ll arrange the referral. The specialist will contact you soon. Please bring your medical records.'
      },
      
      emergencyAlert: {
        type: 'alert',
        template: 'URGENT: Patient {patientName} reports {symptoms}. Severity: {severity}. Needs immediate attention.'
      }
    };
  }

  /**
   * Setup event listeners for health features
   */
  setupHealthEventListeners() {
    document.addEventListener('chatSelected', (e) => this.onChatSelected(e));
  }

  /**
   * Get patient health summary
   */
  getPatientHealthSummary(patientId) {
    return this.patientHealthData[patientId] || null;
  }

  /**
   * Display patient health context in chat header
   */
  displayPatientContext(patientId, chatId) {
    const patient = this.getPatientHealthSummary(patientId);
    if (!patient) return;

    const healthPanel = document.getElementById('patientHealthPanel');
    if (!healthPanel) {
      this.createPatientHealthPanel();
    }

    const html = `
      <div class="patient-health-context">
        <div class="health-info-header">
          <h6 class="mb-2">Patient Information</h6>
          <button class="btn btn-sm btn-link" onclick="healthChat.toggleHealthPanel()" title="Toggle">
            <i class="ri-arrow-down-s-line"></i>
          </button>
        </div>

        <div class="health-info-content">
          <!-- Basic Info -->
          <div class="info-section mb-3">
            <label class="text-muted small">Demographics</label>
            <div class="info-row">
              <span>${patient.name}</span> | 
              <span>${patient.age}y ${patient.sex}</span>
              <span class="text-muted ms-2">${patient.phone}</span>
            </div>
          </div>

          <!-- Active Conditions -->
          ${patient.activeConditions && patient.activeConditions.length > 0 ? `
            <div class="info-section mb-3">
              <label class="text-muted small">Active Conditions</label>
              <div class="condition-tags">
                ${patient.activeConditions.map(c => 
                  `<span class="badge bg-danger-subtle text-danger">${c}</span>`
                ).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Current Medications -->
          ${patient.currentMedications && patient.currentMedications.length > 0 ? `
            <div class="info-section mb-3">
              <label class="text-muted small">Current Medications</label>
              ${patient.currentMedications.map(m => `
                <div class="medication-item" style="font-size: 0.85rem; margin-bottom: 5px;">
                  <strong>${m.name}</strong> ${m.dosage} - ${m.frequency}
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- Allergies -->
          ${patient.allergies && patient.allergies.length > 0 ? `
            <div class="info-section mb-3 p-2 bg-warning-subtle rounded">
              <label class="text-muted small"><strong>⚠️ Allergies</strong></label>
              <div class="allergy-tags">
                ${patient.allergies.map(a => 
                  `<span class="badge bg-warning text-dark">${a}</span>`
                ).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Last Visit & Next Appointment -->
          <div class="info-section mb-3">
            <div class="info-row" style="font-size: 0.85rem;">
              <div>
                <label class="text-muted small">Last Visit</label>
                <div>${patient.lastVisit || 'N/A'}</div>
              </div>
              <div class="ms-3">
                <label class="text-muted small">Next Appointment</label>
                <div class="text-primary">${patient.nextAppointment || 'Not scheduled'}</div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="health-actions mt-3 pt-2 border-top">
            <button class="btn btn-sm btn-primary w-100 mb-2" onclick="healthChat.scheduleAppointment('${patientId}')">
              <i class="ri-calendar-line"></i> Schedule Appointment
            </button>
            <button class="btn btn-sm btn-info w-100 mb-2" onclick="healthChat.sendPrescription('${chatId}')">
              <i class="ri-medicine-bottle-line"></i> Send Prescription
            </button>
            <button class="btn btn-sm btn-outline-secondary w-100" onclick="healthChat.useTemplate('${chatId}')">
              <i class="ri-file-text-line"></i> Message Templates
            </button>
          </div>
        </div>
      </div>
    `;

    const panel = document.getElementById('patientHealthPanel');
    if (panel) {
      panel.innerHTML = html;
      panel.style.display = 'block';
    }
  }

  /**
   * Create patient health panel in chat
   */
  createPatientHealthPanel() {
    const chatHeader = document.getElementById('chatViewHeader');
    if (!chatHeader) return;

    const panelHTML = `
      <div id="patientHealthPanel" class="patient-health-panel" style="
        position: absolute;
        top: 60px;
        right: 20px;
        width: 320px;
        max-height: 500px;
        background: white;
        border: 1px solid #e5e5ea;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        overflow-y: auto;
        padding: 15px;
        z-index: 100;
        display: none;
      "></div>
    `;

    chatHeader.insertAdjacentHTML('afterend', panelHTML);
  }

  /**
   * Toggle patient health panel visibility
   */
  toggleHealthPanel() {
    const panel = document.getElementById('patientHealthPanel');
    if (panel) {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
  }

  /**
   * Send templated message
   */
  sendTemplate(chatId, templateType, variables = {}) {
    const template = this.messageTemplates[templateType];
    if (!template) {
      console.error(`Template ${templateType} not found`);
      return;
    }

    let content = template.template;
    
    // Replace variables
    Object.keys(variables).forEach(key => {
      content = content.replace(`{${key}}`, variables[key]);
    });

    // Create message
    const newMessage = {
      id: Date.now().toString(),
      chatId: chatId,
      senderId: this.chatSystem.currentUser.id,
      senderName: this.chatSystem.currentUser.full_name,
      type: template.type,
      content: content,
      timestamp: new Date().toISOString(),
      attachments: [],
      templateUsed: templateType
    };

    // Save message
    if (!this.chatSystem.messages[chatId]) {
      this.chatSystem.messages[chatId] = [];
    }
    this.chatSystem.messages[chatId].push(newMessage);
    localStorage.setItem(
      `messages_${chatId}`,
      JSON.stringify(this.chatSystem.messages[chatId])
    );

    this.chatSystem.renderMessages();
    return newMessage;
  }

  /**
   * Show template selector modal
   */
  useTemplate(chatId) {
    const templateList = Object.keys(this.messageTemplates).map(key => `
      <button class="btn btn-outline-primary w-100 text-start mb-2" 
              onclick="healthChat.selectTemplate('${chatId}', '${key}')">
        <small class="text-muted">${key.replace(/([A-Z])/g, ' $1').trim()}</small>
      </button>
    `).join('');

    const modal = new bootstrap.Modal(document.getElementById('templateModal') || this.createTemplateModal());
    const modalBody = document.querySelector('#templateModal .modal-body');
    if (modalBody) {
      modalBody.innerHTML = templateList;
    }
    modal.show();
  }

  /**
   * Select and apply template
   */
  selectTemplate(chatId, templateType) {
    const chat = this.chatSystem.chats.find(c => c.id === chatId);
    if (!chat) return;

    // Get variables based on template and patient
    const variables = this.getTemplateVariables(templateType, chat.patientId);
    
    // Show form to fill in variables
    this.showTemplateForm(chatId, templateType, variables);
  }

  /**
   * Get template variables
   */
  getTemplateVariables(templateType, patientId) {
    const patient = this.getPatientHealthSummary(patientId);
    
    return {
      patientName: patient?.name || 'Patient',
      healthWorkerName: this.chatSystem.currentUser.full_name,
      appointmentDate: patient?.nextAppointment || 'TBD',
      appointmentTime: '10:00 AM',
      medicationName: patient?.currentMedications[0]?.name || 'medication',
      dosage: patient?.currentMedications[0]?.dosage || 'as prescribed',
      frequency: patient?.currentMedications[0]?.frequency || 'as directed',
      duration: '7 days',
      condition: patient?.activeConditions[0] || 'your condition',
      symptom: 'symptoms',
      testName: 'Blood Test',
      result: 'Normal',
      interpretation: 'All values are within normal range',
      specialistType: 'Specialist',
      severity: 'Moderate'
    };
  }

  /**
   * Show form to fill template variables
   */
  showTemplateForm(chatId, templateType, defaultVariables) {
    const formHTML = `
      <form id="templateForm">
        ${Object.keys(defaultVariables).map(key => `
          <div class="mb-3">
            <label class="form-label">${key.replace(/([A-Z])/g, ' $1').trim()}</label>
            <input type="text" class="form-control" name="${key}" value="${defaultVariables[key]}" required>
          </div>
        `).join('')}
        <button type="submit" class="btn btn-primary w-100" 
                onclick="healthChat.submitTemplate('${chatId}', '${templateType}')">
          Send Message
        </button>
      </form>
    `;

    // Show in modal or inline
    alert('Fill in the template details and click Send');
  }

  /**
   * Submit filled template
   */
  submitTemplate(chatId, templateType) {
    const form = document.getElementById('templateForm');
    if (!form) return;

    const variables = new FormData(form);
    const variablesObj = Object.fromEntries(variables);

    this.sendTemplate(chatId, templateType, variablesObj);
    
    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('templateModal'))?.hide();
  }

  /**
   * Schedule appointment from chat
   */
  scheduleAppointment(patientId) {
    // This would integrate with the appointment system
    alert(`Opening appointment scheduling for patient ${patientId}`);
    
    // Trigger appointment modal
    if (typeof openAppointmentModal === 'function') {
      openAppointmentModal(patientId);
    }
  }

  /**
   * Send prescription message
   */
  sendPrescription(chatId) {
    const prescriptionForm = `
      <div class="prescription-form" style="padding: 20px; max-width: 400px;">
        <h6>Send Prescription</h6>
        <div class="mb-3">
          <label class="form-label">Medication Name</label>
          <input type="text" class="form-control" id="prescMedicineName" placeholder="e.g., Amoxicillin">
        </div>
        <div class="row mb-3">
          <div class="col">
            <label class="form-label">Dosage</label>
            <input type="text" class="form-control" id="prescDosage" placeholder="e.g., 500mg">
          </div>
          <div class="col">
            <label class="form-label">Frequency</label>
            <input type="text" class="form-control" id="prescFrequency" placeholder="e.g., 3 times daily">
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">Duration</label>
          <input type="text" class="form-control" id="prescDuration" placeholder="e.g., 7 days">
        </div>
        <div class="mb-3">
          <label class="form-label">Warnings/Instructions</label>
          <textarea class="form-control" id="prescWarnings" placeholder="e.g., Take with food, avoid milk"></textarea>
        </div>
        <button class="btn btn-primary w-100" onclick="healthChat.submitPrescription('${chatId}')">
          Send Prescription
        </button>
      </div>
    `;

    // Show as modal or inline
    alert('Prescription form (TODO: integrate with modal)');
  }

  /**
   * Submit prescription
   */
  submitPrescription(chatId) {
    const medicine = document.getElementById('prescMedicineName')?.value;
    const dosage = document.getElementById('prescDosage')?.value;
    const frequency = document.getElementById('prescFrequency')?.value;
    const duration = document.getElementById('prescDuration')?.value;
    const warnings = document.getElementById('prescWarnings')?.value;

    const prescription = {
      medicine, dosage, frequency, duration, warnings
    };

    const variables = {
      medicationName: medicine,
      dosage: dosage,
      frequency: frequency,
      duration: duration,
      warnings: warnings
    };

    this.sendTemplate(chatId, 'prescriptionMessage', variables);
  }

  /**
   * Create consultation request between health workers
   */
  requestConsultation(fromHealthWorkerId, toHealthWorkerId, patientId, message) {
    const request = {
      id: Date.now().toString(),
      fromHealthWorkerId: fromHealthWorkerId,
      toHealthWorkerId: toHealthWorkerId,
      patientId: patientId,
      message: message,
      status: 'pending',
      createdAt: new Date().toISOString(),
      resolvedAt: null
    };

    this.consultationRequests.push(request);
    localStorage.setItem('consultationRequests', JSON.stringify(this.consultationRequests));

    // Notify the other health worker
    this.notifyConsultationRequest(toHealthWorkerId, request);

    return request;
  }

  /**
   * Notify health worker of consultation request
   */
  notifyConsultationRequest(healthWorkerId, request) {
    // Send notification (could be toast, badge, etc)
    console.log(`Consultation request sent to health worker ${healthWorkerId}`);
  }

  /**
   * Log health event for audit trail
   */
  logHealthEvent(eventType, patientId, details) {
    const event = {
      id: Date.now().toString(),
      eventType: eventType,
      patientId: patientId,
      userId: this.chatSystem.currentUser.id,
      details: details,
      timestamp: new Date().toISOString()
    };

    let events = JSON.parse(localStorage.getItem('healthAuditLog') || '[]');
    events.push(event);
    localStorage.setItem('healthAuditLog', JSON.stringify(events));
  }

  /**
   * Create template modal
   */
  createTemplateModal() {
    const modalHTML = `
      <div class="modal fade" id="templateModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Message Templates</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <!-- Templates will be inserted here -->
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    return document.getElementById('templateModal');
  }
}

// Initialize health chat features when ChatSystem is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.chatSystem !== 'undefined' && !window.healthChat) {
      window.healthChat = new HealthChatFeatures(window.chatSystem);
      console.log('Health Chat Features initialized');
    }
  });
}
