## How to run the project

You can run the project using following command. First navigate to backend folder.

`docker-compose up -d --build`

## How to connect to DB

All six logical databases run inside a **single** PostgreSQL container on port `5432`.

1.  Install DBeaver application
2.  Open a Postgres connection with the following credentials:
    - Host: `localhost`
    - Port: `5432`
    - Username: `postgres`
    - Password: `postgres`
3.  Select the desired database from the list below:

| Service              | Database name            | JDBC URL                                              |
|----------------------|--------------------------|-------------------------------------------------------|
| auth-service         | `authdb`                 | `jdbc:postgresql://localhost:5432/authdb`             |
| patient-service      | `patient_service_db`     | `jdbc:postgresql://localhost:5432/patient_service_db` |
| doctor-service       | `doctor_service_db`      | `jdbc:postgresql://localhost:5432/doctor_service_db`  |
| appointment-service  | `appointment_service_db` | `jdbc:postgresql://localhost:5432/appointment_service_db` |
| payment-service      | `payment_service_db`     | `jdbc:postgresql://localhost:5432/payment_service_db` |
| notification-service | `notification_service_db`| `jdbc:postgresql://localhost:5432/notification_service_db` |
