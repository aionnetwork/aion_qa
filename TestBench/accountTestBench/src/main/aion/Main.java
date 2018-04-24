package main.aion;

import main.aion.addressGeneration.RandomAddressGenerator;
import main.aion.txtTransfer.TransactionSenderThreadTxt;

import java.util.Arrays;

public class Main {

    public static void main(String[] args) {

        if (args.length == 0) {
            System.out.println("There were no commandline arguments passed!");
            System.exit(0);
        } else {
            for (String argument : args) {
                if (argument.equals("-h")) {
                    System.out.println("Please choose one of the following commands:\n");
                    System.out.println("-t <account-address> <password> <sleep-time-between-transfers> <max-queue-size>");
                    System.out.println("-c <number-of-addresses-to-create>");
                } else if (argument.equals("-t")) {
                    if (args.length != 5) {
                        System.out.println("Incorrect number of commandline arguments passed!");
                        System.exit(0);
                    }
                    TransactionSenderThreadTxt.main(Arrays.copyOfRange(args, 1, 5));
                } else if (argument.equals("-c")) {
                    if (args.length != 2) {
                        System.out.println("Incorrect number of commandline arguments passed!");
                        System.exit(0);
                    }
                    RandomAddressGenerator.main(Arrays.copyOfRange(args, 1, 2));
                }

            }
        }
    }
}
