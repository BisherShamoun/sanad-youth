import { ConflictException, ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, ApplicationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewApplicationDto } from './dto/review-application.dto';
@Injectable()
export class ApplicationsService {
 constructor(private readonly prisma:PrismaService) {}
 async apply(programId:number,userId:number,cvPath?:string) {
  try { return await this.prisma.$transaction(async tx=>{
   const program=await tx.program.findFirst({where:{id:programId,status:'PUBLISHED'}}); if(!program) throw new NotFoundException('Program not found or not published');
   const existing=await tx.application.findUnique({where:{userId_programId:{userId,programId}}}); if(existing) throw new ConflictException('You have already applied to this program');
   const seat=await tx.program.updateMany({where:{id:programId,status:'PUBLISHED',availableSeats:{gt:0}},data:{availableSeats:{decrement:1}}}); if(seat.count!==1) throw new BadRequestException('No seats are available for this program');
   return tx.application.create({data:{userId,programId,cvPath},include:{program:{select:{id:true,title:true}},user:{select:{id:true,firstName:true,lastName:true}}}});
  },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable}); } catch(e:any) { if(e instanceof Prisma.PrismaClientKnownRequestError && e.code==='P2002') throw new ConflictException('You have already applied to this program'); if(e instanceof Prisma.PrismaClientKnownRequestError && e.code==='P2034') throw new ConflictException('Concurrent request detected. Please retry'); throw e; }
 }
 mine(userId:number) { return this.prisma.application.findMany({where:{userId},orderBy:{createdAt:'desc'},include:{program:{select:{id:true,title:true,imagePath:true,sessions:{orderBy:{startsAt:'asc'}}}}}}); }
 async cancel(id:number,userId:number) { return this.prisma.$transaction(async tx=>{const app=await tx.application.findUnique({where:{id}}); if(!app) throw new NotFoundException('Application not found'); if(app.userId!==userId) throw new ForbiddenException(); if(app.status!=='PENDING') throw new BadRequestException('Only pending applications can be cancelled'); await tx.application.update({where:{id},data:{status:'CANCELLED'}}); await tx.program.update({where:{id:app.programId},data:{availableSeats:{increment:1}}}); return {message:'Application cancelled'};}); }
 async listForProgram(programId:number,userId:number,role:string) { const p=await this.prisma.program.findUnique({where:{id:programId}}); if(!p) throw new NotFoundException('Program not found'); if(role!=='ADMIN' && p.supervisorId!==userId) throw new ForbiddenException('You can only view applications for your own programs'); return this.prisma.application.findMany({where:{programId},orderBy:{createdAt:'desc'},include:{user:{select:{id:true,firstName:true,lastName:true,email:true,username:true}}}}); }
 async review(id:number,dto:ReviewApplicationDto,adminId:number) { return this.prisma.$transaction(async tx=>{const app=await tx.application.findUnique({where:{id}}); if(!app) throw new NotFoundException('Application not found'); if(app.status!=='PENDING') throw new BadRequestException('Only pending applications can be reviewed'); const updated=await tx.application.update({where:{id},data:{status:dto.status,reviewNote:dto.reviewNote,reviewedBy:adminId,reviewedAt:new Date()}}); if(dto.status==='REJECTED') await tx.program.update({where:{id:app.programId},data:{availableSeats:{increment:1}}}); return updated;}); }
}
