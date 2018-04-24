package main.aion;

import org.aion.base.type.Address;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.List;

public class FileReader {
    public static List<Address> readFile(String fileName, List<Address> accountList) {

        try {
            String line;
            java.io.FileReader fileReader = new java.io.FileReader(fileName);
            BufferedReader bufferedReader = new BufferedReader(fileReader);
            while ((line = bufferedReader.readLine()) != null) {
                accountList.add(Address.wrap(line));
            }
            bufferedReader.close();
        } catch (FileNotFoundException ex) {
            System.out.println("[ERROR] Unable to open file '" + fileName + "'");
        } catch (IOException ex) {
            System.out.println("[ERROR] Error reading file '" + fileName + "'");
        } catch (Exception e) {
            e.printStackTrace();
        }
        return accountList;
    }
}
