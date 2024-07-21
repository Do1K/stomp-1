package org.example.stomp1.message;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HelloMessage {

    public String name;

    public HelloMessage() {

    }

    public HelloMessage(String name) {
        this.name = name;
    }
}
