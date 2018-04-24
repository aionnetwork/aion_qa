package main.aion.accountCreation;

import main.aion.FileReader;
import org.aion.api.IAionAPI;
import org.aion.api.type.ApiMsg;
import org.aion.base.type.Address;

import java.math.BigInteger;
import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class Main {
    private static List<Address> accountList = new ArrayList<>();

    public static void run(String[] args) {

        String url = IAionAPI.LOCALHOST_URL;
        int accountCount;
        Address accountFrom;
        String password;
        accountCount = Integer.parseInt(args[0]);
        accountFrom = Address.wrap(args[1]);
        password = args[2];
        int interval = Integer.parseInt(args[3]);
        int queueMax = Integer.parseInt(args[4]);
        Long amount = Long.parseLong(args[5]);
        if (args.length == 7) {
            url = args[6];
        }

        IAionAPI api = IAionAPI.init();
        ApiMsg apiMsg = api.connect(url);
        String fileName = "accounts.txt";

        try {
            File file = new File(fileName);
            if (file.exists() && file.isFile()) {
                FileReader.readFile(fileName, accountList);
                if (accountList.size() != accountCount) {
                    accountList.addAll(AccountGeneratorThread.run(api, apiMsg, accountFrom, amount, (accountCount - accountList.size()), file, password, interval));
                }
            } else {
                accountList = AccountGeneratorThread.run(api, apiMsg, accountFrom, amount, accountCount, file, password, interval);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        try {
            BigInteger bal = api.getChain().getBalance(accountList.get(accountList.size() - 1)).getObject();
            while (bal.compareTo(BigInteger.ZERO) == 0) {
                Thread.sleep(7000);
                bal = api.getChain().getBalance(accountList.get(accountList.size() - 1)).getObject();
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        try{
            TransactionSenderThread.sendTransaction(api, accountList, password, interval, queueMax, url);
        }
        catch(InterruptedException e){
            e.printStackTrace();
        }
    }

}
