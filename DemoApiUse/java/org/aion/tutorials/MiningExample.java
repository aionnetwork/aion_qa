package org.aion.tutorials;

import org.aion.api.IAionAPI;
import org.aion.api.type.ApiMsg;

public class MiningExample {

    public static void main(String[] args) {

        // connect to Java API
        IAionAPI api = IAionAPI.init();
        ApiMsg apiMsg = api.connect(IAionAPI.LOCALHOST_URL);

        // failed connection
        if (apiMsg.isError()) {
            System.out.format("Could not connect due to <%s>%n", apiMsg.getErrString());
            System.exit(-1);
        }

        // 1. eth_mining

        // get status
        Boolean value = api.getMine().isMining().getObject();

        // print
        System.out.println("the kernel " + (value ? "is" : "is not") + " mining");

        // disconnect from api
        api.destroyApi();

        System.exit(0);
    }
}
