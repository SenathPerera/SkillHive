package com.skillshare.repository;

import com.skillshare.model.UserPlanProgress;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserPlanProgressRepository extends MongoRepository<UserPlanProgress, String> {
    // returns all matching progress entries (to detect duplicates)
    List<UserPlanProgress> findByUserIdAndPlanId(String userId, String planId);

    // safely returns just the first matching entry
    Optional<UserPlanProgress> findFirstByUserIdAndPlanId(String userId, String planId);
}
