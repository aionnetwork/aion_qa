package main.aion;

import main.aion.validate.ValidateAccounts;
import java.util.Arrays;
import main.aion.accountCreation.Main;

public class Index {

    public static void main(String[] args) {

        if (args.length == 0) {
            System.out.println("There were no commandline arguments passed!");
            System.exit(0);
        } else {
            for (String argument : args) {
               if( argument.equals("-h")){
                   System.out.println("Please choose one of the following commands:\n");
                   System.out.println("Create accounts, transfer value to them, and start sending transactions from them: ");
                   System.out.println("-c <total-number-of-accounts to create> <sender-account-address> <password> " +
                           "<sleep-time-between-transfers> <max-queue-size-for-unprocessed-transactions> <initial-amount-to-transfer> <*url (optional)>");

                   System.out.println("\n");
                   System.out.println("Validate the balance of created accounts: ");
                   System.out.println("-v <account-address> <password> <min_balance_required> <sleep-time-between-transfers>");

               }
               else if (argument.equals("-v")){
                   if(args.length != 5) {
                       System.out.println("Incorrect number of commandline arguments passed!");
                       System.exit(0);
                   }
                   ValidateAccounts.main(Arrays.copyOfRange(args, 1, 5));
               }
               else if (argument.equals("-c")){
                   if(args.length < 6) {
                       System.out.println("Incorrect number of commandline arguments passed!");
                       System.exit(0);
                   }
                   Main.run(Arrays.copyOfRange(args, 1, args.length));
               }

            }
        }
    }
}
