package com.ankit.contactdirectory.controller;

import com.ankit.contactdirectory.model.Contact;
import com.ankit.contactdirectory.service.ContactService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/contacts")
@CrossOrigin("*")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @GetMapping
    public List<Contact> getAllContacts() {
        return contactService.getAllContacts();
    }

    @PostMapping
    public Contact addContact(@RequestBody Contact contact) {
        return contactService.addContact(contact);
    }

    @DeleteMapping("/{id}")
    public String deleteContact(@PathVariable Long id) {

        boolean deleted = contactService.deleteContact(id);

        if (deleted) {
            return "Contact deleted successfully";
        }

        return "Contact not found";
    }
}