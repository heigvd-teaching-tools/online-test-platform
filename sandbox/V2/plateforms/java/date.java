import java.util.Scanner;
import java.util.Date;

public class Main {
    // The days of the week are: "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    static String getDayName(String dateString) {
        String[] dayNames = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
        Date date = new Date(dateString);
        int dayOfWeek = date.getDay();
        return dayNames[dayOfWeek];
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int d = scanner.nextInt();
        scanner.nextLine(); // consume newline after int

        for (int i = 0; i < d; i++) {
            String date = scanner.nextLine();
            System.out.println(getDayName(date));
        }
    }
}
