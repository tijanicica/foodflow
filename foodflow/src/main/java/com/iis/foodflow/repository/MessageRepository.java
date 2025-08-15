package com.iis.foodflow.repository;

import com.iis.foodflow.model.support.Message;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {}
