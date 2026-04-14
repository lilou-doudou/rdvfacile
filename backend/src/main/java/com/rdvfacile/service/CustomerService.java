package com.rdvfacile.service;

import com.rdvfacile.dto.customer.CustomerRequest;
import com.rdvfacile.dto.customer.CustomerResponse;
import com.rdvfacile.exception.BusinessException;
import com.rdvfacile.exception.ResourceNotFoundException;
import com.rdvfacile.model.Business;
import com.rdvfacile.model.Customer;
import com.rdvfacile.repository.BusinessRepository;
import com.rdvfacile.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final BusinessRepository businessRepository;

    public List<CustomerResponse> getAll(UUID businessId) {
        return customerRepository.findByBusinessId(businessId)
                .stream().map(this::toResponse).toList();
    }

    public CustomerResponse getById(UUID id, UUID businessId) {
        return customerRepository.findByIdAndBusinessId(id, businessId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable"));
    }

    @Transactional
    public CustomerResponse create(CustomerRequest request, UUID businessId) {
        if (customerRepository.existsByPhoneAndBusinessId(request.getPhone(), businessId)) {
            throw new BusinessException("Un client avec ce numéro existe déjà");
        }

        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business introuvable"));

        Customer customer = new Customer();
        customer.setFullName(request.getFullName());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        customer.setNotes(request.getNotes());
        customer.setBusiness(business);

        return toResponse(customerRepository.save(customer));
    }

    @Transactional
    public CustomerResponse update(UUID id, CustomerRequest request, UUID businessId) {
        Customer customer = customerRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable"));

        // Vérifie unicité du téléphone si changé
        if (!customer.getPhone().equals(request.getPhone()) &&
            customerRepository.existsByPhoneAndBusinessId(request.getPhone(), businessId)) {
            throw new BusinessException("Un client avec ce numéro existe déjà");
        }

        customer.setFullName(request.getFullName());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        customer.setNotes(request.getNotes());

        return toResponse(customerRepository.save(customer));
    }

    @Transactional
    public void delete(UUID id, UUID businessId) {
        Customer customer = customerRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable"));
        customerRepository.delete(customer);
    }

    /**
     * Trouve ou crée un client par numéro de téléphone (utilisé par le flux WhatsApp).
     */
    @Transactional
    public Customer findOrCreateByPhone(String phone, String fullName, UUID businessId) {
        return customerRepository.findByPhoneAndBusinessId(phone, businessId)
                .orElseGet(() -> {
                    Business business = businessRepository.findById(businessId)
                            .orElseThrow(() -> new ResourceNotFoundException("Business introuvable"));
                    Customer c = new Customer();
                    c.setPhone(phone);
                    c.setFullName(fullName != null ? fullName : phone);
                    c.setBusiness(business);
                    return customerRepository.save(c);
                });
    }

    private CustomerResponse toResponse(Customer c) {
        CustomerResponse r = new CustomerResponse();
        r.setId(c.getId());
        r.setFullName(c.getFullName());
        r.setPhone(c.getPhone());
        r.setEmail(c.getEmail());
        r.setNotes(c.getNotes());
        return r;
    }
}
