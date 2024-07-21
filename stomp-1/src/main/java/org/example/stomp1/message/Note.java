package org.example.stomp1.message;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Note {

    private String content;

    public Note() {

    }

    public Note(String content) {
        this.content = content;
    }
}
