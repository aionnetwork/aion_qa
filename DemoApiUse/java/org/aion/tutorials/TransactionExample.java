package org.aion.tutorials;

import org.aion.api.IAionAPI;
import org.aion.api.type.*;
import org.aion.base.type.Address;
import org.aion.base.type.Hash256;

import java.math.BigInteger;

import static java.lang.Thread.sleep;

public class TransactionExample {

    public static void main(String[] args) throws InterruptedException {

        // connect to Java API
        IAionAPI api = IAionAPI.init();
        ApiMsg apiMsg = api.connect(IAionAPI.LOCALHOST_URL);

        // failed connection
        if (apiMsg.isError()) {
            System.out.format("Could not connect due to <%s>%n", apiMsg.getErrString());
            System.exit(-1);
        }

        // 1. eth_getTransactionByHash

        // specify hash
        Hash256 hash = Hash256.wrap("0x5f2e74ade04ab9f6e8d4acd394f7f51832d4706d7268eea0ecc6391f94185b80");

        // get tx with given hash
        Transaction tx = api.getChain().getTransactionByHash(hash).getObject();

        // print tx information
        System.out.format("transaction details:%n%s%n", tx);

        // 2. eth_getTransactionByBlockHashAndIndex

        // specify block hash
        hash = Hash256.wrap("0x50a906f4ccaf05a3ebca69cc4f84a116e6aec881e3c4d080c4df505fea65afab");
        // specify tx index = 0 -> first tx
        int index = 0;

        // get tx with given hash & index
        tx = api.getChain().getTransactionByBlockHashAndIndex(hash, index).getObject();

        // print tx information
        System.out.format("transaction details:%n%s%n", tx);

        // 3. eth_getTransactionByBlockNumberAndIndex

        // specify block number
        long number = 247726L;
        // specify tx index = 1 -> second tx
        index = 1;

        // get tx with given number & index
        tx = api.getChain().getTransactionByBlockNumberAndIndex(number, index).getObject();

        // print tx information
        System.out.format("transaction details:%n%s%n", tx);

        // 4. eth_getTransactionReceipt

        // specify tx hash
        hash = Hash256.wrap("0x2a1d8dc09f2c6670690bbda74377f59c8737df9812cf7c794fa35409d200fe3f");

        // get receipt for given tx hash
        TxReceipt txReceipt = api.getTx().getTxReceipt(hash).getObject();

        // print tx receipt
        System.out.format("transaction receipt:%n%s%n", txReceipt);

        // 5. eth_sendTransaction

        // specify accounts and amount
        Address sender = Address.wrap("a06f02e986965ddd3398c4de87e3708072ad58d96e9c53e87c31c8c970b211e5");
        Address receiver = Address.wrap("a0bd0ef93902d9e123521a67bef7391e9487e963b2346ef3b3ff78208835545e");
        BigInteger amount = BigInteger.valueOf(1_000_000_000_000_000_000L); // = 1 AION

        // unlock sender
        boolean isUnlocked = api.getWallet().unlockAccount(sender, "password", 100).getObject();
        System.out.format("sender account %s%n", isUnlocked ? "unlocked" : "locked");

        // create transaction
        TxArgs.TxArgsBuilder builder = new TxArgs.TxArgsBuilder().from(sender).to(receiver).value(amount);

        // perform transaction
        Hash256 txHash = ((MsgRsp) api.getTx().sendTransaction(builder.createTxArgs()).getObject()).getTxHash();
        System.out.format("%ntransaction hash: %s%n", txHash);

        // print receipt
        txReceipt = api.getTx().getTxReceipt(txHash).getObject();
        // repeat till tx processed
        while (txReceipt == null) {
            // wait 10 sec
            sleep(10000);
            txReceipt = api.getTx().getTxReceipt(txHash).getObject();
        }
        System.out.format("%ntransaction receipt:%n%s%n", txReceipt);

        // disconnect from api
        api.destroyApi();

        System.exit(0);
    }
}
