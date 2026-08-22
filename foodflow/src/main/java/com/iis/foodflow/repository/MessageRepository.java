package com.iis.foodflow.repository;

import com.iis.foodflow.model.support.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MessageRepository extends JpaRepository<Message, Long> {
    @Modifying
    @Query("UPDATE Message m SET m.read = true WHERE m.supportTicket.id = :ticketId AND m.senderOperator IS NOT NULL AND m.read = false")
    void markMessagesAsReadByOperator(@Param("ticketId") Long ticketId);

    @Modifying
    @Query("UPDATE Message m SET m.read = true WHERE m.supportTicket.id = :ticketId AND m.senderCustomer IS NOT NULL AND m.read = false")
    void markMessagesAsReadByCustomer(@Param("ticketId") Long ticketId);
}
