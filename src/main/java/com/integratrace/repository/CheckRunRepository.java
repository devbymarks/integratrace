package com.integratrace.repository;
import com.integratrace.model.CheckRun;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface CheckRunRepository extends JpaRepository<CheckRun,Long> {
 List<CheckRun> findTop100ByOrderByCheckedAtDesc();
 List<CheckRun> findTop50ByIntegration_IdOrderByCheckedAtDesc(Long id);
 List<CheckRun> findTop500ByOrderByCheckedAtDesc();
}
