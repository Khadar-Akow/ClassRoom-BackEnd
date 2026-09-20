import { relations } from "drizzle-orm";
import { pgTable, integer, timestamp ,varchar } from "drizzle-orm/pg-core";

const timestamps ={
    createAt: timestamp('create_at').defaultNow().notNull(),
    updateAt: timestamp('update_at').defaultNow().$onUpdate( ()=> new Date()).notNull(),
}

export const departments = pgTable('departments',{
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    code: varchar('code',{length: 50}).notNull().unique(),
    name: varchar('name',{length:255}).notNull(),
    description: varchar('description',{length: 255}),
    ... timestamps
})

export const subjects = pgTable('subjects',{
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    departmentId: integer('department_id').notNull().references(() => departments.id, {onDelete: 'restrict'}),
    name: varchar('name',{length:255}).notNull(),
    code: varchar('code',{length: 50}).notNull().unique(),
    description: varchar('description',{length: 255}),
    ... timestamps
})

export const departmentRelations = relations(departments ,({ many}) => ({subjects: many(subjects)}))
export const subjectRelations = relations(subjects,({one , many}) => ({
    department: one(departments,{
        fields: [subjects.departmentId],
        references: [departments.id]
    })}));

export type Department = typeof departments.$inferSelect
export type newDepartment = typeof departments.$inferInsert

export type Subject = typeof subjects.$inferSelect
export type newSubject = typeof subjects.$inferInsert