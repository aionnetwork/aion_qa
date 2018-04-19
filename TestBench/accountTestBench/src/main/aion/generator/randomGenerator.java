package main.aion.generator;

import org.aion.api.type.Key;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.util.List;
import java.util.Random;

public class randomGenerator {

    public static void main(String args[]){
        BufferedWriter output;
        String fileName = args[0];
        int count = Integer.parseInt(args[1]);
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
