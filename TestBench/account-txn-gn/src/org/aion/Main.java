package org.aion;

import org.aion.api.IAionAPI;
import org.aion.api.type.ApiMsg;
import org.aion.api.type.Key;
import org.aion.base.type.Address;

import java.io.*;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

public class Main {

    private static List<Address> k = new ArrayList<>();
    public static int NUM_ACCOUNTS;
    public static int NUM_TX = 1;
    static IAionAPI api = IAionAPI.init();
    static ApiMsg apiMsg = api.connect(IAionAPI.LOCALHOST_URL);
    static String accountFrom;
    static String password;

    public static void main(String[] args) {
        try {
	        NUM_ACCOUNTS = Integer.parseInt(args[0]);
	        accountFrom = args[1];
	        password = args[2];

            File file = new File("accounts.txt");
            if (file.exists() && file.isFile()) {
                readFile();
            } else {
                k = AccountCreation.init(api, apiMsg, accountFrom, NUM_ACCOUNTS, file, password);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        int iteration = 1;
        while(true) {
            System.out.println("Iteration #" + iteration + ", sending " + NUM_TX + " transactions");
            TransactionGenerator.sendContinuousTransaction(api, apiMsg, NUM_ACCOUNTS, k, NUM_TX, password);
            NUM_TX += 10;
            iteration++;
        }
    }

    public static void readFile() {


        String temp = "";

        try {
            String fileName = "accounts.txt";
            temp = fileName;
            String line = null;

            FileReader fileReader = new FileReader(fileName);

            BufferedReader bufferedReader = new BufferedReader(fileReader);

            while ((line = bufferedReader.readLine()) != null) {
                k.add(Address.wrap(line));
            }

            bufferedReader.close();
        } catch (FileNotFoundException ex) {
            System.out.println("Unable to open file '" + temp + "'");
        } catch (IOException ex) {
            System.out.println("Error reading file '" + temp + "'");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
