package main.aion.addressGeneration;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.util.Random;

/**
 * Class to generate a number of random addresses and store it in a text file
 */
public class RandomAddressGenerator {

    public static void main(String args[]){
        BufferedWriter output;
        String fileName = "dummyAccounts.txt";
        int count = Integer.parseInt(args[0]);
        try {
            File file = new File(fileName);
            FileWriter f = new FileWriter(file, false);
            output = new BufferedWriter(f);
            for(int i = 0; i< count; i ++){
                String s = getRandomHexString();
                output.write(s);
                output.newLine();
                output.flush();
            }
            output.close();

        } catch (Exception e) {
            System.out.println("fileWriter through an exception!");
            e.printStackTrace();
        }
    }

    private static String getRandomHexString(){

        Random r = new Random();
        StringBuffer sb = new StringBuffer();
        while(sb.length() < 62){
            sb.append(Integer.toHexString(r.nextInt()));
        }

        return "0a" + sb.toString().substring(0, 62);
    }
}
