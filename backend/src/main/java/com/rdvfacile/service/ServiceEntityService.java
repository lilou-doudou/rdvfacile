package com.rdvfacile.service;

import com.rdvfacile.dto.service.ServiceRequest;
import com.rdvfacile.dto.service.ServiceResponse;
import com.rdvfacile.exception.BusinessException;
import com.rdvfacile.exception.ResourceNotFoundException;
import com.rdvfacile.model.Business;
import com.rdvfacile.model.ServiceEntity;
import com.rdvfacile.repository.BusinessRepository;
import com.rdvfacile.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ServiceEntityService {

    private final ServiceRepository serviceRepository;
    private final BusinessRepository businessRepository;

    public List<ServiceResponse> getAll(UUID businessId) {
        return serviceRepository.findByBusinessIdAndActiveTrue(businessId)
                .stream()
                .filter(e -> e.getName() != null && !e.getName().isBlank())
                .map(this::toResponse).toList();
    }

    public ServiceResponse getById(UUID id, UUID businessId) {
        return serviceRepository.findByIdAndBusinessId(id, businessId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Service introuvable"));
    }

    @Transactional
    public ServiceResponse create(ServiceRequest request, UUID businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business introuvable"));

        ServiceEntity entity = new ServiceEntity();
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        entity.setDurationMinutes(request.getDurationMinutes());
        entity.setPrice(request.getPrice());
        entity.setBusiness(business);

        return toResponse(serviceRepository.save(entity));
    }

    @Transactional
    public ServiceResponse update(UUID id, ServiceRequest request, UUID businessId) {
        ServiceEntity entity = serviceRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Service introuvable"));

        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        entity.setDurationMinutes(request.getDurationMinutes());
        entity.setPrice(request.getPrice());

        return toResponse(serviceRepository.save(entity));
    }

    @Transactional
    public void delete(UUID id, UUID businessId) {
        ServiceEntity entity = serviceRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Service introuvable"));
        // Soft delete
        entity.setActive(false);
        serviceRepository.save(entity);
    }

    private ServiceResponse toResponse(ServiceEntity e) {
        ServiceResponse r = new ServiceResponse();
        r.setId(e.getId());
        r.setName(e.getName());
        r.setDescription(e.getDescription());
        r.setDurationMinutes(e.getDurationMinutes());
        r.setPrice(e.getPrice());
        r.setActive(e.getActive());
        return r;
    }
}
