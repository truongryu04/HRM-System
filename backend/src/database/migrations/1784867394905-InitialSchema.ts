import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1784867394905 implements MigrationInterface {
  name = 'InitialSchema1784867394905';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TABLE "departments" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "code" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "status" character varying NOT NULL DEFAULT 'ACTIVE', "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isDeleted" boolean NOT NULL DEFAULT false, "manager_id" integer, CONSTRAINT "UQ_8681da666ad9699d568b3e91064" UNIQUE ("name"), CONSTRAINT "UQ_91fddbe23e927e1e525c152baa3" UNIQUE ("code"), CONSTRAINT "PK_839517a681a86bb84cbcc6a1e9d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "positions" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "name" character varying NOT NULL, "level" character varying, "description" character varying, "status" character varying NOT NULL DEFAULT 'ACTIVE', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e21258bdc3692b44960c623940f" UNIQUE ("code"), CONSTRAINT "UQ_5c70dc5aa01e351730e4ffc929c" UNIQUE ("name"), CONSTRAINT "PK_17e4e62ccd5749b289ae3fae6f3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "module" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_8dad765629e83229da6feda1c1d" UNIQUE ("code"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isDeleted" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('PENDING', 'ACTIVE', 'INACTIVE', 'LOCKED', 'SUSPENDED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "status" "public"."users_status_enum" NOT NULL DEFAULT 'PENDING', "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "lastLoginAt" TIMESTAMP, "employee_id" integer, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "work_shifts" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "startTime" TIME NOT NULL, "endTime" TIME NOT NULL, "breakStart" TIME, "breakEnd" TIME, "lateAfter" TIME NOT NULL, "standardMinutes" integer NOT NULL DEFAULT '480', "isActive" boolean NOT NULL DEFAULT true, "isDefault" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b2a38af2ce39f461936aec85484" UNIQUE ("name"), CONSTRAINT "PK_30826a4f3460a48369193453043" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."employees_gender_enum" AS ENUM('MALE', 'FEMALE', 'OTHER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."employees_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'RESIGNED', 'TERMINATED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "employees" ("id" SERIAL NOT NULL, "employeeCode" character varying NOT NULL, "email" character varying NOT NULL, "fullName" character varying NOT NULL, "gender" "public"."employees_gender_enum" NOT NULL, "dob" date NOT NULL, "phone" character varying, "address" character varying, "joinDate" date NOT NULL, "status" "public"."employees_status_enum" NOT NULL DEFAULT 'ACTIVE', "avatarUrl" character varying, "avatar_public_id" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isDeleted" boolean NOT NULL DEFAULT false, "department_id" integer, "position_id" integer, "manager_id" integer, "work_shift_id" integer, CONSTRAINT "UQ_e3d0372d1ebe64cf827743666ce" UNIQUE ("employeeCode"), CONSTRAINT "UQ_765bc1ac8967533a04c74a9f6af" UNIQUE ("email"), CONSTRAINT "PK_b9535a98350d5b26e7eb0c26af4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "attendances" ("id" SERIAL NOT NULL, "attendanceDate" date NOT NULL, "checkInTime" TIMESTAMP, "checkOutTime" TIMESTAMP, "workMinutes" integer, "workingDayValue" numeric(5,2), "lateMinutes" integer DEFAULT '0', "isLate" boolean NOT NULL DEFAULT false, "earlyLeaveMinutes" integer DEFAULT '0', "isEarlyLeave" boolean NOT NULL DEFAULT false, "note" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "employee_id" integer, CONSTRAINT "UQ_990040e4083f2b1a4d19444e612" UNIQUE ("employee_id", "attendanceDate"), CONSTRAINT "PK_483ed97cd4cd43ab4a117516b69" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "token" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4542dd2f38a61354a040ba9fd57" UNIQUE ("token"), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "request_types" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying, "isActive" boolean NOT NULL DEFAULT true, "isDeleted" boolean NOT NULL DEFAULT false, "handlerKey" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_78a714dd9cf2a799a79a3f338ec" UNIQUE ("code"), CONSTRAINT "PK_795c261c2ebf6beb3f417acd40b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "approval_flows" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "subtype_key" character varying(100), "subtype_label" character varying(255), "isActive" boolean NOT NULL DEFAULT true, "isDeleted" boolean NOT NULL DEFAULT false, "isDefault" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "request_type_id" integer, CONSTRAINT "PK_5a76ef416fd5f10289c0178cc0e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."requests_status_enum" AS ENUM('pending', 'confirmed', 'approved', 'rejected', 'canceled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "requests" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "title" character varying NOT NULL, "status" "public"."requests_status_enum" NOT NULL DEFAULT 'pending', "currentStepOrder" integer NOT NULL DEFAULT '1', "finalApprovedAt" TIMESTAMP, "rejectedAt" TIMESTAMP, "rejectionReason" character varying, "note" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "request_type_id" integer, "employee_id" integer, "created_by" integer, "approval_flow_id" integer, "final_approved_by" integer, "rejected_by" integer, CONSTRAINT "UQ_7e107146f8defa7286a86e37c95" UNIQUE ("code"), CONSTRAINT "PK_0428f484e96f9e6a55955f29b5f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."leave_types_code_enum" AS ENUM('ANNUAL_LEAVE', 'UNPAID_LEAVE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "leave_types" ("id" SERIAL NOT NULL, "code" "public"."leave_types_code_enum", "name" character varying NOT NULL, "description" character varying, "isPaid" boolean NOT NULL DEFAULT true, "annualQuota" numeric(5,1) NOT NULL DEFAULT '0', "deductFromBalance" boolean NOT NULL DEFAULT true, "isDeleted" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_600530eb1d9f853dd746e5819c4" UNIQUE ("code"), CONSTRAINT "UQ_e41bb9537ef5e65ee2de2cfa81a" UNIQUE ("name"), CONSTRAINT "PK_359223e0755d19711813cd07394" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "leave_balances" ("id" SERIAL NOT NULL, "year" smallint NOT NULL, "annualGranted" numeric(6,1) NOT NULL DEFAULT '0', "carryOverGranted" numeric(6,1) NOT NULL DEFAULT '0', "adjustment" numeric(6,1) NOT NULL DEFAULT '0', "annualUsed" numeric(6,1) NOT NULL DEFAULT '0', "carryOverUsed" numeric(6,1) NOT NULL DEFAULT '0', "carryOverExpired" numeric(6,1) NOT NULL DEFAULT '0', "version" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "employee_id" integer NOT NULL, "leave_type_id" integer NOT NULL, CONSTRAINT "PK_a1d90dff48fb2bfd23a7163d077" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_leave_balance_employee_type_year" ON "leave_balances"  ("employee_id", "leave_type_id", "year") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."leave_balance_transactions_type_enum" AS ENUM('GRANT', 'ADJUSTMENT', 'DEDUCT', 'REFUND', 'CARRY_OVER', 'EXPIRE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "leave_balance_transactions" ("id" SERIAL NOT NULL, "type" "public"."leave_balance_transactions_type_enum" NOT NULL, "amount" numeric(6,1) NOT NULL, "referenceKey" character varying, "note" text, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "leave_balance_id" integer NOT NULL, "request_id" integer, "created_by" integer, CONSTRAINT "PK_77a3c80c57f0e54b766aa37dde3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_f0794a86f33f595f653f9dc233" ON "leave_balance_transactions"  ("referenceKey") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."leave_requests_session_enum" AS ENUM('FULL', 'AM', 'PM')`,
    );
    await queryRunner.query(
      `CREATE TABLE "leave_requests" ("id" SERIAL NOT NULL, "startDate" date NOT NULL, "endDate" date NOT NULL, "session" "public"."leave_requests_session_enum" NOT NULL DEFAULT 'FULL', "totalDays" numeric(5,1) NOT NULL DEFAULT '0', "reason" text NOT NULL, "attachment" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "request_id" integer, "leave_type_id" integer, CONSTRAINT "REL_3d6bfd8e62068c2fa88decb45b" UNIQUE ("request_id"), CONSTRAINT "PK_d3abcf9a16cef1450129e06fa9f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_leave_requests_request_id" ON "leave_requests"  ("request_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."leave_request_days_session_enum" AS ENUM('FULL', 'AM', 'PM')`,
    );
    await queryRunner.query(
      `CREATE TABLE "leave_request_days" ("id" SERIAL NOT NULL, "date" date NOT NULL, "value" numeric(3,1) NOT NULL, "session" "public"."leave_request_days_session_enum" NOT NULL DEFAULT 'FULL', "isPaid" boolean NOT NULL DEFAULT true, "deductFromBalance" boolean NOT NULL DEFAULT true, "leave_request_id" integer, "employee_id" integer, "leave_type_id" integer, CONSTRAINT "PK_0d29b66c00f709d61c70266b55c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."approval_step_templates_approvertype_enum" AS ENUM('DIRECT_MANAGER', 'ROLE', 'POSITION', 'SPECIFIC_USER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "approval_step_templates" ("id" SERIAL NOT NULL, "stepName" character varying NOT NULL, "approverType" "public"."approval_step_templates_approvertype_enum" NOT NULL, "roleCode" character varying, "positionCode" character varying, "condition" jsonb, "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "specific_user_id" integer, CONSTRAINT "PK_9ff170d01728aaa90e3ddcef73f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."approval_flow_steps_approvertype_enum" AS ENUM('DIRECT_MANAGER', 'ROLE', 'POSITION', 'SPECIFIC_USER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "approval_flow_steps" ("id" SERIAL NOT NULL, "stepOrder" integer NOT NULL, "stepName" character varying NOT NULL, "approverType" "public"."approval_flow_steps_approvertype_enum" NOT NULL, "roleCode" character varying, "positionCode" character varying, "condition" jsonb, "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "flow_id" integer, "approval_step_template_id" integer, "specific_user_id" integer, CONSTRAINT "PK_9bb92a1bf67a4d657f821820b9a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."request_approvals_approvertype_enum" AS ENUM('DIRECT_MANAGER', 'ROLE', 'POSITION', 'SPECIFIC_USER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."request_approvals_status_enum" AS ENUM('WAITING', 'PENDING', 'APPROVED', 'REJECTED', 'SKIPPED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "request_approvals" ("id" SERIAL NOT NULL, "stepOrder" integer NOT NULL, "stepName" character varying NOT NULL, "approverType" "public"."request_approvals_approvertype_enum" NOT NULL, "roleCode" character varying, "positionCode" character varying, "status" "public"."request_approvals_status_enum" NOT NULL DEFAULT 'WAITING', "actedAt" TIMESTAMP, "note" character varying, "request_id" integer, "specific_user_id" integer, "acted_by" integer, CONSTRAINT "PK_569731be3f86c267a23c5d9d39e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "request_histories" ("id" SERIAL NOT NULL, "action" character varying NOT NULL, "note" character varying, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "request_id" integer, "actor_id" integer, CONSTRAINT "PK_8909732b604b9950b0e19e9771b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_tokens_type_enum" AS ENUM('activate_account', 'reset_password')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_tokens" ("id" SERIAL NOT NULL, "type" "public"."user_tokens_type_enum" NOT NULL, "tokenHash" character varying(64) NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "usedAt" TIMESTAMP, "failedAttempts" integer NOT NULL DEFAULT '0', "lastSentAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer NOT NULL, CONSTRAINT "PK_63764db9d9aaa4af33e07b2f4bf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6c87eaa5d56e55bbd1dfdeaaa6" ON "user_tokens"  ("userId", "type") `,
    );
    await queryRunner.query(
      `CREATE TABLE "role_permissions" ("rolesId" integer NOT NULL, "permissionsId" uuid NOT NULL, CONSTRAINT "PK_7931614007a93423204b4b73240" PRIMARY KEY ("rolesId", "permissionsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0cb93c5877d37e954e2aa59e52" ON "role_permissions"  ("rolesId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d422dabc78ff74a8dab6583da0" ON "role_permissions"  ("permissionsId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user_roles" ("usersId" integer NOT NULL, "rolesId" integer NOT NULL, CONSTRAINT "PK_38ffcfb865fc628fa337d9a0d4f" PRIMARY KEY ("usersId", "rolesId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_99b019339f52c63ae615358738" ON "user_roles"  ("usersId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_13380e7efec83468d73fc37938" ON "user_roles"  ("rolesId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" ADD CONSTRAINT "FK_ef8a4fb89ff96bbe98f1798798c" FOREIGN KEY ("manager_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_9760615d88ed518196bb79ea03d" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "FK_678a3540f843823784b0fe4a4f2" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "FK_8b14204e8af5e371e36b8c11e1b" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "FK_bcdf921072a19dd2758a628c5c0" FOREIGN KEY ("manager_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "FK_12c45c4e3bfc41a4b0da9f5ca37" FOREIGN KEY ("work_shift_id") REFERENCES "work_shifts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendances" ADD CONSTRAINT "FK_43dca8b4751d7449a38b583991c" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_flows" ADD CONSTRAINT "FK_7c796a72d72583cd54c8c571ed0" FOREIGN KEY ("request_type_id") REFERENCES "request_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests" ADD CONSTRAINT "FK_99539191a02fda75b6ada50f11b" FOREIGN KEY ("request_type_id") REFERENCES "request_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests" ADD CONSTRAINT "FK_bdc11d6321ec9dff5c8b09c1a21" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests" ADD CONSTRAINT "FK_2d487b151e34f5924c3d8adb5da" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests" ADD CONSTRAINT "FK_0cef7addae8a9a2cbe6b46de120" FOREIGN KEY ("approval_flow_id") REFERENCES "approval_flows"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests" ADD CONSTRAINT "FK_6710c9b7244984cf282e1c306bc" FOREIGN KEY ("final_approved_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests" ADD CONSTRAINT "FK_2461b67d528d7d93ef2fad76d35" FOREIGN KEY ("rejected_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_balances" ADD CONSTRAINT "FK_2f8aebce74941a2e2168e94ba68" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_balances" ADD CONSTRAINT "FK_d64da0a991d2f4d23d86031530c" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_balance_transactions" ADD CONSTRAINT "FK_f6304db64939c81e2b70451ac6e" FOREIGN KEY ("leave_balance_id") REFERENCES "leave_balances"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_balance_transactions" ADD CONSTRAINT "FK_c38138a406aa92d75dde2858a27" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_balance_transactions" ADD CONSTRAINT "FK_0109b755bd28730e1e9fbb547a4" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_requests" ADD CONSTRAINT "FK_3d6bfd8e62068c2fa88decb45b8" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_requests" ADD CONSTRAINT "FK_54a57db316598806786c2b95323" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_request_days" ADD CONSTRAINT "FK_b0df7a21a1dce813054b354d86d" FOREIGN KEY ("leave_request_id") REFERENCES "leave_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_request_days" ADD CONSTRAINT "FK_7888ffe964d507e27bfc3c12734" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_request_days" ADD CONSTRAINT "FK_7cbb14f0591480ba7528062fcf0" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_step_templates" ADD CONSTRAINT "FK_c51f4879be5e52e419bdaa1b043" FOREIGN KEY ("specific_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_flow_steps" ADD CONSTRAINT "FK_8cf4f92127cb6d932125433b8ce" FOREIGN KEY ("flow_id") REFERENCES "approval_flows"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_flow_steps" ADD CONSTRAINT "FK_d50d21a45a06c36b0ea35c2ffcc" FOREIGN KEY ("approval_step_template_id") REFERENCES "approval_step_templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_flow_steps" ADD CONSTRAINT "FK_b5eca686142f34b370e3af343cc" FOREIGN KEY ("specific_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "request_approvals" ADD CONSTRAINT "FK_40bb76e5a8a4295fe71cf9c114e" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "request_approvals" ADD CONSTRAINT "FK_ddd37a8f724f7c194e7fa2a68a5" FOREIGN KEY ("specific_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "request_approvals" ADD CONSTRAINT "FK_5c64784c5b3488acb53255402ab" FOREIGN KEY ("acted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "request_histories" ADD CONSTRAINT "FK_c617f2d1cd8c35b7537e45ad7f0" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "request_histories" ADD CONSTRAINT "FK_5498d45c4a97211b2b9876a5b37" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tokens" ADD CONSTRAINT "FK_92ce9a299624e4c4ffd99b645b6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_0cb93c5877d37e954e2aa59e52c" FOREIGN KEY ("rolesId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_d422dabc78ff74a8dab6583da02" FOREIGN KEY ("permissionsId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_99b019339f52c63ae6153587380" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_13380e7efec83468d73fc37938e" FOREIGN KEY ("rolesId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_13380e7efec83468d73fc37938e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_99b019339f52c63ae6153587380"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_d422dabc78ff74a8dab6583da02"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_0cb93c5877d37e954e2aa59e52c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tokens" DROP CONSTRAINT "FK_92ce9a299624e4c4ffd99b645b6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "request_histories" DROP CONSTRAINT "FK_5498d45c4a97211b2b9876a5b37"`,
    );
    await queryRunner.query(
      `ALTER TABLE "request_histories" DROP CONSTRAINT "FK_c617f2d1cd8c35b7537e45ad7f0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "request_approvals" DROP CONSTRAINT "FK_5c64784c5b3488acb53255402ab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "request_approvals" DROP CONSTRAINT "FK_ddd37a8f724f7c194e7fa2a68a5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "request_approvals" DROP CONSTRAINT "FK_40bb76e5a8a4295fe71cf9c114e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_flow_steps" DROP CONSTRAINT "FK_b5eca686142f34b370e3af343cc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_flow_steps" DROP CONSTRAINT "FK_d50d21a45a06c36b0ea35c2ffcc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_flow_steps" DROP CONSTRAINT "FK_8cf4f92127cb6d932125433b8ce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_step_templates" DROP CONSTRAINT "FK_c51f4879be5e52e419bdaa1b043"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_request_days" DROP CONSTRAINT "FK_7cbb14f0591480ba7528062fcf0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_request_days" DROP CONSTRAINT "FK_7888ffe964d507e27bfc3c12734"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_request_days" DROP CONSTRAINT "FK_b0df7a21a1dce813054b354d86d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_requests" DROP CONSTRAINT "FK_54a57db316598806786c2b95323"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_requests" DROP CONSTRAINT "FK_3d6bfd8e62068c2fa88decb45b8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_balance_transactions" DROP CONSTRAINT "FK_0109b755bd28730e1e9fbb547a4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_balance_transactions" DROP CONSTRAINT "FK_c38138a406aa92d75dde2858a27"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_balance_transactions" DROP CONSTRAINT "FK_f6304db64939c81e2b70451ac6e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_balances" DROP CONSTRAINT "FK_d64da0a991d2f4d23d86031530c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_balances" DROP CONSTRAINT "FK_2f8aebce74941a2e2168e94ba68"`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests" DROP CONSTRAINT "FK_2461b67d528d7d93ef2fad76d35"`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests" DROP CONSTRAINT "FK_6710c9b7244984cf282e1c306bc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests" DROP CONSTRAINT "FK_0cef7addae8a9a2cbe6b46de120"`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests" DROP CONSTRAINT "FK_2d487b151e34f5924c3d8adb5da"`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests" DROP CONSTRAINT "FK_bdc11d6321ec9dff5c8b09c1a21"`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests" DROP CONSTRAINT "FK_99539191a02fda75b6ada50f11b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_flows" DROP CONSTRAINT "FK_7c796a72d72583cd54c8c571ed0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendances" DROP CONSTRAINT "FK_43dca8b4751d7449a38b583991c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "FK_12c45c4e3bfc41a4b0da9f5ca37"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "FK_bcdf921072a19dd2758a628c5c0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "FK_8b14204e8af5e371e36b8c11e1b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "FK_678a3540f843823784b0fe4a4f2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_9760615d88ed518196bb79ea03d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" DROP CONSTRAINT "FK_ef8a4fb89ff96bbe98f1798798c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_13380e7efec83468d73fc37938"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_99b019339f52c63ae615358738"`,
    );
    await queryRunner.query(`DROP TABLE "user_roles"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d422dabc78ff74a8dab6583da0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0cb93c5877d37e954e2aa59e52"`,
    );
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6c87eaa5d56e55bbd1dfdeaaa6"`,
    );
    await queryRunner.query(`DROP TABLE "user_tokens"`);
    await queryRunner.query(`DROP TYPE "public"."user_tokens_type_enum"`);
    await queryRunner.query(`DROP TABLE "request_histories"`);
    await queryRunner.query(`DROP TABLE "request_approvals"`);
    await queryRunner.query(
      `DROP TYPE "public"."request_approvals_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."request_approvals_approvertype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "approval_flow_steps"`);
    await queryRunner.query(
      `DROP TYPE "public"."approval_flow_steps_approvertype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "approval_step_templates"`);
    await queryRunner.query(
      `DROP TYPE "public"."approval_step_templates_approvertype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "leave_request_days"`);
    await queryRunner.query(
      `DROP TYPE "public"."leave_request_days_session_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."UQ_leave_requests_request_id"`,
    );
    await queryRunner.query(`DROP TABLE "leave_requests"`);
    await queryRunner.query(`DROP TYPE "public"."leave_requests_session_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f0794a86f33f595f653f9dc233"`,
    );
    await queryRunner.query(`DROP TABLE "leave_balance_transactions"`);
    await queryRunner.query(
      `DROP TYPE "public"."leave_balance_transactions_type_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."UQ_leave_balance_employee_type_year"`,
    );
    await queryRunner.query(`DROP TABLE "leave_balances"`);
    await queryRunner.query(`DROP TABLE "leave_types"`);
    await queryRunner.query(`DROP TYPE "public"."leave_types_code_enum"`);
    await queryRunner.query(`DROP TABLE "requests"`);
    await queryRunner.query(`DROP TYPE "public"."requests_status_enum"`);
    await queryRunner.query(`DROP TABLE "approval_flows"`);
    await queryRunner.query(`DROP TABLE "request_types"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "attendances"`);
    await queryRunner.query(`DROP TABLE "employees"`);
    await queryRunner.query(`DROP TYPE "public"."employees_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."employees_gender_enum"`);
    await queryRunner.query(`DROP TABLE "work_shifts"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP TABLE "positions"`);
    await queryRunner.query(`DROP TABLE "departments"`);
  }
}
