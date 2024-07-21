package org.example.stomp1.message;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class Join {


    private String username;
    private int roomId;
    private Date time;

    public Join() {

    }

}
