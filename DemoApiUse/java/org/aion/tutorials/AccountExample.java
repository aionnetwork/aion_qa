package org.aion.tutorials;

import org.aion.api.IAionAPI;
import org.aion.api.type.ApiMsg;
import org.aion.base.type.Address;

import java.math.BigInteger;
import java.util.List;

public class AccountExample {

    public static void main(String[] args) {

        // connect to Java API
        IAionAPI api = IAionAPI.init();
        ApiMsg apiMsg = api.connect(IAionAPI.LOCALHOST_URL);

        // failed connection
        if (apiMsg.isError()) {
            System.out.format("Could not connect due to <%s>%n", apiMsg.getErrString());
            System.exit(-1);
        }

        // 1. eth_accounts

        // get accounts from API
        List<Address> accounts = api.getWallet().getAccounts().getObject();

        // print accounts to standard output
        System.out.format("the keystore contains %d accounts, as follow:%n", accounts.size());
        for (Address account : accounts) {
            System.out.format("\t%s%n", account.toString());
        }

        // 2. eth_coinbase

        // get miner account
        Address account = api.getWallet().getMinerAccount().getObject();

        // print retrieved value
        System.out.format("%ncoinbase account = %s%n", account.toString());

        // 3. eth_getBalance

        // interpret string as address
        account = Address.wrap("a06f02e986965ddd3398c4de87e3708072ad58d96e9c53e87c31c8c970b211e5");

        // get account balance
        BigInteger balance = api.getChain().getBalance(account).getObject();

        // print balance
        System.out.format("%n%s has balance = %d nAmp (over %d AION)%n",
                          account.toString(),
                          balance,
                          balance.divide(BigInteger.TEN.pow(18)));

        // 4. eth_getTransactionCount

        // interpret string as address
        // note that hex prefix '0x' is optional
        account = Address.wrap("0xa06f02e986965ddd3398c4de87e3708072ad58d96e9c53e87c31c8c970b211e5");

        // get number of transactions sent by account
        BigInteger txCount = api.getChain().getNonce(account).getObject();

        // print performed transactions
        System.out.format("%n%s performed %d transactions%n", account.toString(), txCount);

        // 5. eth_getBalance & eth_getTransactionCount for each keystore account

        // print balance & tx count to standard output
        System.out.format("%nthe keystore contains %d accounts, as follow:%n", accounts.size());
        for (Address acc : accounts) {
            System.out.format("\t%s balance = %22d nAmp, tx count = %2d%n",
                              acc.toString(),
                              api.getChain().getBalance(acc).getObject(),
                              api.getChain().getNonce(acc).getObject());
        }

        // disconnect from api
        api.destroyApi();

        System.exit(0);
    }
}
