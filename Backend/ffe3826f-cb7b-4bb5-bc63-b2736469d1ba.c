#include <stdio.h>

int main() {
    int number;

    // Input from user
    printf("Enter an integer: ");
    scanf("%d", &number);

    // Check even or odd
    if (number % 2 == 0)
        printf("%d is Even.\n", number);
    else
        printf("%d is Odd.\n", number);

    return 0;
}
