package com.resolvehub.backend.auth;

public class DuplicateEmailException extends RuntimeException {

    DuplicateEmailException(String message) {
        super(message);
    }
}
