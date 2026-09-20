import { and, eq, getTableColumns, ilike, or, sql,desc } from 'drizzle-orm';
import express from 'express';
import { departments, subjects } from '../db/schema';
import { db } from '../db';

const router = express.Router();

//get all subjects with optional search filtering and pagination
router.get('/', async (req, res) => {
    try {   
        const{search, department, page = 1, limit = 10} = req.query;

        const currentPage = Math.max(1,parseInt(String(page),10) || 1);
        const limitPerPage = Math.min(Math.max(1,parseInt(String(limit),10) || 10), 100);

        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = []
        if(search){
            filterConditions.push(
                or(
                    ilike(subjects.name,`%${search}%`),
                    ilike(subjects.code,`%${search}%`)
                )
            )
        }
        if(department){
            const deptPattern = `%${String(department).replace( /[%_]/g,'\\$&')}%`
            filterConditions.push(ilike(departments.name,deptPattern))
        }
        //combine all filter using and if any exist
        const WhereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const countResult = await db
        .select({count: sql<number>`count(*) `})
        .from(subjects)
        .leftJoin(departments, eq(subjects.departmentId, departments.id))
        .where(WhereClause)

        const TotalCount = countResult[0]?.count ?? 0;

        const subjectsList = await db
        .select({
            ... getTableColumns(subjects),
            department: {...getTableColumns(departments)}
        }).from(subjects).leftJoin(departments, eq(subjects.departmentId, departments.id))
        .where(WhereClause)
        .orderBy(desc(subjects.createAt))
        .offset(offset)
        .limit(limitPerPage)

        res.status(200).json({
            data: subjectsList,
            Pagination:{
                page: currentPage,
                limit: limitPerPage,
                total: TotalCount,
                totalPages: Math.ceil(TotalCount / limitPerPage)
            }
        })
    }
    catch(e){
        console.error('Get /subjects error',e)
        res.status(500).json({error:'filed to get /subjects'})
    }
})

export default router;