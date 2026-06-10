package com.ankit.contactdirectory.service;

import com.ankit.contactdirectory.model.Contact;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ContactService {

    private final List<Contact> contacts = new ArrayList<>();

    public ContactService() {

contacts.add(
    new Contact(
        1L,
        "Ankit kumar",
        "9234425704",
        "Ankit.kumar1@Rungta.org",
        "Friends"
    )
);

contacts.add(
    new Contact(
        2L,
        "Ates",
        "1111111111",
        "Mark.03@ates.in",
        "Work"
    )
);
    }

    public List<Contact> getAllContacts() {
        return contacts;
    }

    public Contact addContact(Contact contact) {

        contact.setId((long) (contacts.size() + 1));

        contacts.add(contact);

        return contact;
    }

    public boolean deleteContact(Long id) {

        return contacts.removeIf(
                contact -> contact.getId().equals(id)
        );
    }
}