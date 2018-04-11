package main.aion;

import org.aion.api.IAionAPI;
import org.aion.api.type.ApiMsg;
import org.aion.base.type.Address;

import java.math.BigInteger;
import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class Main {
    private static List<Address> accountList = new ArrayList<>();
    private static int accountCount;

    static Address accountFrom;
    static String password;

    public static void main(String[] args) {

        String url = IAionAPI.LOCALHOST_URL;
        accountCount = Integer.parseInt(args[0]);
        accountFrom = Address.wrap(args[1]);
        password = args[2];
        int interval = Integer.parseInt(args[3]);
        Long tail_addr = args[4].equals("0") ? Long.MAX_VALUE : Long.valueOf(args[2]);
        int queueMax = Integer.parseInt(args[5]);
        if (args.length == 7) {
            url = args[6];
        }

        IAionAPI api = IAionAPI.init();
        ApiMsg apiMsg = api.connect(url);
        String fileName = "accounts.txt";
        try {
            File file = new File(fileName);
            if (file.exists() && file.isFile()) {
                readFile(fileName);
                if (accountList.size() != accountCount) {
                    accountList.addAll(AccountGeneratorThread.run(api, apiMsg, accountFrom, (accountCount - accountList.size()), file, password));
                }
            } else {
                accountList = AccountGeneratorThread.run(api, apiMsg, accountFrom, accountCount, file, password);
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
            TransactionSenderThread.sendTransaction(api, accountList, password, tail_addr, interval, queueMax, url);
        }
        catch(InterruptedException e){
            e.printStackTrace();
        }
    }

    public static void readFile(String fileName) {

        try {
            String line;
            FileReader fileReader = new FileReader(fileName);
            BufferedReader bufferedReader = new BufferedReader(fileReader);
            while ((line = bufferedReader.readLine()) != null) {
                accountList.add(Address.wrap(line));
            }
            bufferedReader.close();
        } catch (FileNotFoundException ex) {
            System.out.println("Unable to open file '" + fileName + "'");
        } catch (IOException ex) {
            System.out.println("Error reading file '" + fileName + "'");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
