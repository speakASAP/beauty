# Event Storming (Textual)

## Beauty Franchise MVP

---

## Related Documentation

- [Domain Glossary](domain-glossary.md) - Domain terms used in events
- [Technical Design Document](tdd.md) - Event contracts and schemas
- [Delivery Plan](../plans/delivery-plan.md) - Implementation phases
- [Master Prompt](../agents/master-prompt.md) - Lead Orchestrator Agent role
- [Platform Decomposition Plan](../plans/ai_orchestrated_platform_decomposition.md) - Task decomposition strategy

## 1. Client Lifecycle (Main Flow)

client.registered  
→ appointment.booked  
→ appointment.confirmed  
→ appointment.started  
→ appointment.completed  
→ visit.closed  
→ order.created  
→ payment.received  
→ inventory.decreased  
→ client.visit_recorded

---

## 2. Online Booking (public website)

slot.requested  
→ availability.checked  
→ appointment.booked  
→ notification.sent (SMS / email)

---

## 3. Cancellation and No-Show

appointment.booked  
→ appointment.cancelled  
→ slot.released  

or

appointment.booked  
→ appointment.no_show  
→ penalty.applied (optional, post-MVP)

---

## 4. Walk-in Client (without booking)

visit.started  
→ order.created  
→ payment.received  
→ visit.closed  

---

## 5. Payment (General Model)

order.created  
→ payment.initiated  
→ payment.received  
→ payment.confirmed  

(or)

→ payment.failed  

---

## 6. Inventory

inventory.item.received  
→ inventory.increased  

inventory.audit.started  
→ inventory.adjusted  

---

## 7. Integrations (downstream)

payment.received  
→ accounting.export_requested  

order.closed  
→ accounting.export_completed  

appointment.booked  
→ sms.sent  

---

## Event Invariants

- No event requests data synchronously
- All downstream processes are reactive
- BI consumes all core events (read-only, maintains read models)
- Scheduling Core does not know about money and warehouse

---
